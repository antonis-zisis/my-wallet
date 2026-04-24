import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Profile } from './Profile';

const mockUpdateUser = vi.fn();
const mockUpdatePassword = vi.fn();
const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();

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

vi.mock('../contexts/ToastContext', () => ({
  useToast: vi.fn().mockReturnValue({
    showSuccess: (...args: Array<unknown>) => mockShowSuccess(...args),
    showError: (...args: Array<unknown>) => mockShowError(...args),
    showInfo: vi.fn(),
  }),
}));

describe('Profile', () => {
  beforeEach(() => {
    mockUpdateUser.mockReset();
    mockUpdatePassword.mockReset();
    mockShowSuccess.mockReset();
    mockShowError.mockReset();
  });

  it('renders email as non-editable display and fullName as editable input', () => {
    render(<Profile />);

    expect(screen.getAllByText('test@example.com').length).toBeGreaterThan(0);
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();

    const nameInput = screen.getByLabelText('Full name') as HTMLInputElement;
    expect(nameInput.value).toBe('John Doe');
    expect(nameInput).not.toHaveAttribute('readOnly');
  });

  it('renders Personal info and Change password section headings', () => {
    render(<Profile />);
    expect(
      screen.getByRole('heading', { name: 'Personal info' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Change password' })
    ).toBeInTheDocument();
  });

  describe('Save button', () => {
    it('is disabled when name has not changed', () => {
      render(<Profile />);
      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    });

    it('is enabled when name has changed', async () => {
      render(<Profile />);
      const nameInput = screen.getByLabelText('Full name');
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'Jane Doe');
      expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
    });
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

    await waitFor(() => {
      expect(mockShowSuccess).toHaveBeenCalledWith('Profile updated.');
    });
  });

  it('shows error when profile update fails', async () => {
    mockUpdateUser.mockRejectedValueOnce(new Error('fail'));
    render(<Profile />);

    const nameInput = screen.getByLabelText('Full name');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Jane Doe');

    fireEvent.submit(screen.getAllByText('Save')[0].closest('form')!);

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('Failed to update profile.');
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
      expect(mockShowError).toHaveBeenCalledWith('Passwords do not match.');
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
      expect(mockShowError).toHaveBeenCalledWith(
        'Password must be at least 6 characters.'
      );
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

    await waitFor(() => {
      expect(mockShowSuccess).toHaveBeenCalledWith('Password changed.');
    });
  });
});
