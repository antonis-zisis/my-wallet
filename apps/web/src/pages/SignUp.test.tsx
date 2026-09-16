import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import {
  makeSupabaseSession,
  resolveGetSession,
  resolveSignUp,
} from '../test/fixtures';
import { SignUp } from './SignUp';

const renderSignUp = () => {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <MemoryRouter initialEntries={['/signup']}>
          <Routes>
            <Route path="/signup" element={<SignUp />} />
            <Route path="/" element={<div>Home Page</div>} />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

const submitForm = async (
  password = 'password',
  confirmPassword = password
) => {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText('Email'), 'new@example.com');
  await user.type(screen.getByLabelText('Password'), password);
  await user.type(screen.getByLabelText('Confirm password'), confirmPassword);
  await user.click(screen.getByRole('button', { name: 'Create account' }));
};

describe('SignUp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supabase.auth.getSession).mockResolvedValue(
      resolveGetSession(null)
    );
    vi.mocked(supabase.auth.signUp).mockResolvedValue(resolveSignUp());
  });

  it('renders the email and password fields', async () => {
    renderSignUp();

    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm password')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Create account' })
    ).toBeInTheDocument();
  });

  it('asks the new user to confirm their email address', async () => {
    renderSignUp();

    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });
    await submitForm();

    expect(await screen.findByText('Check your email')).toBeInTheDocument();
    expect(
      screen.getByText(/We've sent a confirmation link to new@example.com/)
    ).toBeInTheDocument();
  });

  it('shows an error when the address is already registered', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValueOnce(
      resolveSignUp({ error: { message: 'User already registered' } })
    );

    renderSignUp();

    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });
    await submitForm();

    expect(
      await screen.findByText('User already registered')
    ).toBeInTheDocument();
  });

  it('shows an error when the passwords do not match', async () => {
    renderSignUp();

    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });
    await submitForm('password', 'different');

    expect(
      await screen.findByText('Passwords do not match.')
    ).toBeInTheDocument();
    expect(supabase.auth.signUp).not.toHaveBeenCalled();
  });

  it('redirects an already signed-in visitor home', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue(
      resolveGetSession(makeSupabaseSession())
    );

    renderSignUp();

    expect(await screen.findByText('Home Page')).toBeInTheDocument();
  });
});
