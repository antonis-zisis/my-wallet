import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from '../contexts/ThemeContext';
import { ForgotPassword } from './ForgotPassword';

const mockSendPasswordResetEmail = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({
    sendPasswordResetEmail: (...args: Array<unknown>) =>
      mockSendPasswordResetEmail(...args),
  }),
}));

const renderForgotPassword = () =>
  render(
    <ThemeProvider>
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    </ThemeProvider>
  );

beforeEach(() => {
  mockSendPasswordResetEmail.mockReset();
  mockSendPasswordResetEmail.mockResolvedValue({ error: null });
});

describe('ForgotPassword', () => {
  it('renders the email form', () => {
    renderForgotPassword();

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Send reset link' })
    ).toBeInTheDocument();
  });

  it('disables the button until an email is entered', async () => {
    renderForgotPassword();

    expect(
      screen.getByRole('button', { name: 'Send reset link' })
    ).toBeDisabled();

    await userEvent
      .setup()
      .type(screen.getByLabelText('Email'), 'user@example.com');

    expect(
      screen.getByRole('button', { name: 'Send reset link' })
    ).toBeEnabled();
  });

  it('shows a neutral confirmation after submitting', async () => {
    renderForgotPassword();

    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.click(screen.getByRole('button', { name: 'Send reset link' }));

    expect(
      screen.getByText(/If an account exists for user@example.com/)
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
  });
});
