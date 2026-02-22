import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Profile } from './Profile';

const mockUpdateUser = vi.fn();
const mockUpdatePassword = vi.fn();

vi.mock('../contexts/UserContext', () => ({
  useUser: vi.fn().mockReturnValue({
    user: { id: '1', email: 'test@example.com', fullName: 'John Doe' },
    loading: false,
    updateUser: (...args: Array<unknown>) => mockUpdateUser(...args),
  }),
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({
    session: { access_token: 'token' },
    loading: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    updatePassword: (...args: Array<unknown>) => mockUpdatePassword(...args),
  }),
}));

describe('Profile', () => {
  beforeEach(() => {
    mockUpdateUser.mockReset();
    mockUpdatePassword.mockReset();
  });

  it('renders email as read-only and fullName as editable', () => {
    render(<Profile />);

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    expect(emailInput.value).toBe('test@example.com');
    expect(emailInput).toHaveAttribute('readOnly');

    const nameInput = screen.getByLabelText('Full name') as HTMLInputElement;
    expect(nameInput.value).toBe('John Doe');
    expect(nameInput).not.toHaveAttribute('readOnly');
  });

  it('submits profile update with trimmed full name', async () => {
    mockUpdateUser.mockResolvedValueOnce(undefined);
    render(<Profile />);

    const nameInput = screen.getByLabelText('Full name');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Jane Doe');

    fireEvent.submit(screen.getAllByText('Save')[0].closest('form')!);

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({ fullName: 'Jane Doe' });
    });

    expect(screen.getByText('Profile updated.')).toBeInTheDocument();
  });

  it('shows error when profile update fails', async () => {
    mockUpdateUser.mockRejectedValueOnce(new Error('fail'));
    render(<Profile />);

    fireEvent.submit(screen.getAllByText('Save')[0].closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Failed to update profile.')).toBeInTheDocument();
    });
  });

  it('validates passwords must match', async () => {
    render(<Profile />);

    await userEvent.type(screen.getByLabelText('New password'), 'password123');
    await userEvent.type(
      screen.getByLabelText('Confirm password'),
      'different'
    );

    const passwordForm = screen.getByLabelText('New password').closest('form')!;
    fireEvent.submit(passwordForm);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    });

    expect(mockUpdatePassword).not.toHaveBeenCalled();
  });

  it('validates minimum password length', async () => {
    render(<Profile />);

    await userEvent.type(screen.getByLabelText('New password'), 'short');
    await userEvent.type(screen.getByLabelText('Confirm password'), 'short');

    const passwordForm = screen.getByLabelText('New password').closest('form')!;
    fireEvent.submit(passwordForm);

    await waitFor(() => {
      expect(
        screen.getByText('Password must be at least 6 characters.')
      ).toBeInTheDocument();
    });

    expect(mockUpdatePassword).not.toHaveBeenCalled();
  });

  it('submits password change with valid input', async () => {
    mockUpdatePassword.mockResolvedValueOnce({ error: null });
    render(<Profile />);

    await userEvent.type(screen.getByLabelText('New password'), 'newpass123');
    await userEvent.type(
      screen.getByLabelText('Confirm password'),
      'newpass123'
    );

    const passwordForm = screen.getByLabelText('New password').closest('form')!;
    fireEvent.submit(passwordForm);

    await waitFor(() => {
      expect(mockUpdatePassword).toHaveBeenCalledWith('newpass123');
    });

    expect(screen.getByText('Password changed.')).toBeInTheDocument();
  });
});
