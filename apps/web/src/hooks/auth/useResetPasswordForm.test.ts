import { act, renderHook } from '@testing-library/react';
import type { ChangeEvent, SubmitEvent } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useResetPasswordForm } from './useResetPasswordForm';

const mockUpdatePassword = vi.fn();
const mockSignOut = vi.fn();
const mockShowSuccess = vi.fn();
const mockNavigate = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');

  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('../../contexts/ToastContext', () => ({
  useToast: () => ({
    showSuccess: (...args: Array<unknown>) => mockShowSuccess(...args),
    showError: vi.fn(),
  }),
}));

const mockEvent = { preventDefault: vi.fn() } as unknown as SubmitEvent;

const changeEvent = (value: string) =>
  ({ target: { value } }) as ChangeEvent<HTMLInputElement>;

const typePasswords = (
  result: { current: ReturnType<typeof useResetPasswordForm> },
  newPassword: string,
  confirmPassword: string
) => {
  act(() => result.current.onNewPasswordChange(changeEvent(newPassword)));
  act(() =>
    result.current.onConfirmPasswordChange(changeEvent(confirmPassword))
  );
};

beforeEach(() => {
  mockUpdatePassword.mockReset();
  mockSignOut.mockReset();
  mockShowSuccess.mockReset();
  mockNavigate.mockReset();
  mockUpdatePassword.mockResolvedValue({ error: null });
  mockUseAuth.mockReturnValue({
    loading: false,
    session: { access_token: 'recovery-token' },
    signOut: mockSignOut,
    updatePassword: mockUpdatePassword,
  });
});

describe('useResetPasswordForm', () => {
  it('allows setting a password when a recovery session exists', () => {
    const { result } = renderHook(() => useResetPasswordForm());

    expect(result.current.canSetPassword).toBe(true);
  });

  it('blocks the form when there is no session', () => {
    mockUseAuth.mockReturnValue({
      loading: false,
      session: null,
      signOut: mockSignOut,
      updatePassword: mockUpdatePassword,
    });

    const { result } = renderHook(() => useResetPasswordForm());

    expect(result.current.canSetPassword).toBe(false);
  });

  it('shows a validation error and does not submit when passwords differ', async () => {
    const { result } = renderHook(() => useResetPasswordForm());

    typePasswords(result, 'sup3rsecret', 'sup3rsecrets');
    await act(async () => {
      await result.current.onSubmit(mockEvent);
    });

    expect(result.current.error).toBe('Passwords do not match.');
    expect(mockUpdatePassword).not.toHaveBeenCalled();
  });

  it('updates the password, signs out and returns to sign in on success', async () => {
    const { result } = renderHook(() => useResetPasswordForm());

    typePasswords(result, 'sup3rsecret', 'sup3rsecret');
    await act(async () => {
      await result.current.onSubmit(mockEvent);
    });

    expect(mockUpdatePassword).toHaveBeenCalledWith('sup3rsecret');
    expect(mockSignOut).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    expect(mockShowSuccess).toHaveBeenCalled();
  });

  it('surfaces the error and stays put when the update fails', async () => {
    mockUpdatePassword.mockResolvedValue({
      error: new Error('New password should be different from the old one.'),
    });

    const { result } = renderHook(() => useResetPasswordForm());

    typePasswords(result, 'sup3rsecret', 'sup3rsecret');
    await act(async () => {
      await result.current.onSubmit(mockEvent);
    });

    expect(result.current.error).toBe(
      'New password should be different from the old one.'
    );
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(result.current.submitting).toBe(false);
  });
});
