import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from '../contexts/ThemeContext';
import { ResetPassword } from './ResetPassword';

const mockUpdatePassword = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');

  return { ...actual, useNavigate: () => vi.fn() };
});

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('../contexts/ToastContext', () => ({
  useToast: () => ({ showSuccess: vi.fn(), showError: vi.fn() }),
}));

const renderResetPassword = () =>
  render(
    <ThemeProvider>
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    </ThemeProvider>
  );

beforeEach(() => {
  mockUpdatePassword.mockReset();
  mockUpdatePassword.mockResolvedValue({ error: null });
  mockUseAuth.mockReturnValue({
    loading: false,
    session: { access_token: 'recovery-token' },
    signOut: vi.fn(),
    updatePassword: mockUpdatePassword,
  });
});

describe('ResetPassword', () => {
  it('shows a spinner while the session is loading', () => {
    mockUseAuth.mockReturnValue({
      loading: true,
      session: null,
      signOut: vi.fn(),
      updatePassword: mockUpdatePassword,
    });

    renderResetPassword();

    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('explains the link expired when there is no recovery session', () => {
    mockUseAuth.mockReturnValue({
      loading: false,
      session: null,
      signOut: vi.fn(),
      updatePassword: mockUpdatePassword,
    });

    renderResetPassword();

    expect(
      screen.getByText(/invalid or has already been used/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Request a new link' })
    ).toBeInTheDocument();
  });

  it('renders the password fields for a recovery session', () => {
    renderResetPassword();

    expect(screen.getByLabelText('New password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm new password')).toBeInTheDocument();
  });

  it('shows a mismatch error without calling updatePassword', async () => {
    renderResetPassword();

    const user = userEvent.setup();
    await user.type(screen.getByLabelText('New password'), 'sup3rsecret');
    await user.type(
      screen.getByLabelText('Confirm new password'),
      'sup3rsecrets'
    );
    await user.click(screen.getByRole('button', { name: 'Update password' }));

    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    expect(mockUpdatePassword).not.toHaveBeenCalled();
  });

  it('submits the new password', async () => {
    renderResetPassword();

    const user = userEvent.setup();
    await user.type(screen.getByLabelText('New password'), 'sup3rsecret');
    await user.type(
      screen.getByLabelText('Confirm new password'),
      'sup3rsecret'
    );
    await user.click(screen.getByRole('button', { name: 'Update password' }));

    expect(mockUpdatePassword).toHaveBeenCalledWith('sup3rsecret');
  });
});
