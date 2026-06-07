import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import {
  makeSupabaseSession,
  resolveGetSession,
  resolveSignIn,
} from '../test/fixtures';
import { Login } from './Login';

const renderLogin = () => {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<div>Home Page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supabase.auth.getSession).mockResolvedValue(
      resolveGetSession(null)
    );
  });

  it('renders email and password inputs and submit button', async () => {
    renderLogin();

    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('shows error message on failed sign-in', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce(
      resolveSignIn({ error: { message: 'Invalid login credentials' } })
    );

    renderLogin();

    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid login credentials')).toBeInTheDocument();
    });
  });

  it('disables button and shows a spinner while submitting', async () => {
    type SignInResult = ReturnType<typeof resolveSignIn>;
    let resolveSignInPromise!: (value: SignInResult) => void;
    vi.mocked(supabase.auth.signInWithPassword).mockImplementationOnce(
      () =>
        new Promise<SignInResult>((resolve) => {
          resolveSignInPromise = resolve;
        })
    );

    renderLogin();

    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Sign in' })).toBeDisabled();
    });

    resolveSignInPromise(resolveSignIn());
  });

  it('redirects to / when user is already authenticated', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce(
      resolveGetSession(makeSupabaseSession())
    );

    renderLogin();

    await waitFor(() => {
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });
  });
});
