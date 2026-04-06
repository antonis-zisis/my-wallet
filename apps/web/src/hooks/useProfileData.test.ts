import { act, renderHook } from '@testing-library/react';
import type { SubmitEvent } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useProfileData } from './useProfileData';

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
    updatePassword: (...args: Array<unknown>) => mockUpdatePassword(...args),
  }),
}));

vi.mock('../contexts/ToastContext', () => ({
  useToast: vi.fn().mockReturnValue({
    showSuccess: (...args: Array<unknown>) => mockShowSuccess(...args),
    showError: (...args: Array<unknown>) => mockShowError(...args),
  }),
}));

const mockEvent = { preventDefault: vi.fn() } as unknown as SubmitEvent;

beforeEach(() => {
  mockUpdateUser.mockReset();
  mockUpdatePassword.mockReset();
  mockShowSuccess.mockReset();
  mockShowError.mockReset();
  mockEvent.preventDefault = vi.fn();
});

describe('useProfileData', () => {
  describe('initial state', () => {
    it('populates fullName and email from user context', () => {
      const { result } = renderHook(() => useProfileData());

      expect(result.current.fullName).toBe('John Doe');
      expect(result.current.email).toBe('test@example.com');
    });

    it('sets isNameUnchanged to true initially', () => {
      const { result } = renderHook(() => useProfileData());

      expect(result.current.isNameUnchanged).toBe(true);
    });

    it('starts not saving', () => {
      const { result } = renderHook(() => useProfileData());

      expect(result.current.profileSaving).toBe(false);
      expect(result.current.passwordSaving).toBe(false);
    });

    it('starts with empty password fields', () => {
      const { result } = renderHook(() => useProfileData());

      expect(result.current.newPassword).toBe('');
      expect(result.current.confirmPassword).toBe('');
    });
  });

  describe('onFullNameChange', () => {
    it('updates fullName', () => {
      const { result } = renderHook(() => useProfileData());

      act(() => {
        result.current.onFullNameChange({
          target: { value: 'Jane Doe' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.fullName).toBe('Jane Doe');
    });

    it('sets isNameUnchanged false when name differs', () => {
      const { result } = renderHook(() => useProfileData());

      act(() => {
        result.current.onFullNameChange({
          target: { value: 'Jane Doe' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.isNameUnchanged).toBe(false);
    });

    it('sets isNameUnchanged true when name is restored to original', () => {
      const { result } = renderHook(() => useProfileData());

      act(() => {
        result.current.onFullNameChange({
          target: { value: 'Jane Doe' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.onFullNameChange({
          target: { value: 'John Doe' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.isNameUnchanged).toBe(true);
    });

    it('treats whitespace-only difference as unchanged', () => {
      const { result } = renderHook(() => useProfileData());

      act(() => {
        result.current.onFullNameChange({
          target: { value: '  John Doe  ' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.isNameUnchanged).toBe(true);
    });
  });

  describe('onProfileSubmit', () => {
    it('calls updateUser with trimmed fullName on success', async () => {
      mockUpdateUser.mockResolvedValueOnce(undefined);
      const { result } = renderHook(() => useProfileData());

      act(() => {
        result.current.onFullNameChange({
          target: { value: '  Jane Doe  ' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      await act(async () => {
        await result.current.onProfileSubmit(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockUpdateUser).toHaveBeenCalledWith({ fullName: 'Jane Doe' });
    });

    it('shows success toast after successful update', async () => {
      mockUpdateUser.mockResolvedValueOnce(undefined);
      const { result } = renderHook(() => useProfileData());

      act(() => {
        result.current.onFullNameChange({
          target: { value: 'Jane Doe' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      await act(async () => {
        await result.current.onProfileSubmit(mockEvent);
      });

      expect(mockShowSuccess).toHaveBeenCalledWith('Profile updated.');
      expect(result.current.profileSaving).toBe(false);
    });

    it('shows error toast when updateUser throws', async () => {
      mockUpdateUser.mockRejectedValueOnce(new Error('network error'));
      const { result } = renderHook(() => useProfileData());

      act(() => {
        result.current.onFullNameChange({
          target: { value: 'Jane Doe' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      await act(async () => {
        await result.current.onProfileSubmit(mockEvent);
      });

      expect(mockShowError).toHaveBeenCalledWith('Failed to update profile.');
      expect(result.current.profileSaving).toBe(false);
    });
  });

  describe('onPasswordSubmit', () => {
    it('shows error toast when passwords do not match', async () => {
      const { result } = renderHook(() => useProfileData());

      act(() => {
        result.current.onNewPasswordChange({
          target: { value: 'password123' },
        } as React.ChangeEvent<HTMLInputElement>);
        result.current.onConfirmPasswordChange({
          target: { value: 'different' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      await act(async () => {
        await result.current.onPasswordSubmit(mockEvent);
      });

      expect(mockShowError).toHaveBeenCalledWith('Passwords do not match.');
      expect(mockUpdatePassword).not.toHaveBeenCalled();
    });

    it('shows error toast when password is too short', async () => {
      const { result } = renderHook(() => useProfileData());

      act(() => {
        result.current.onNewPasswordChange({
          target: { value: 'short' },
        } as React.ChangeEvent<HTMLInputElement>);
        result.current.onConfirmPasswordChange({
          target: { value: 'short' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      await act(async () => {
        await result.current.onPasswordSubmit(mockEvent);
      });

      expect(mockShowError).toHaveBeenCalledWith(
        'Password must be at least 6 characters.'
      );
      expect(mockUpdatePassword).not.toHaveBeenCalled();
    });

    it('calls updatePassword and shows success toast on valid input', async () => {
      mockUpdatePassword.mockResolvedValueOnce({ error: null });
      const { result } = renderHook(() => useProfileData());

      act(() => {
        result.current.onNewPasswordChange({
          target: { value: 'newpass123' },
        } as React.ChangeEvent<HTMLInputElement>);
        result.current.onConfirmPasswordChange({
          target: { value: 'newpass123' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      await act(async () => {
        await result.current.onPasswordSubmit(mockEvent);
      });

      expect(mockUpdatePassword).toHaveBeenCalledWith('newpass123');
      expect(mockShowSuccess).toHaveBeenCalledWith('Password changed.');
    });

    it('clears password fields after successful change', async () => {
      mockUpdatePassword.mockResolvedValueOnce({ error: null });
      const { result } = renderHook(() => useProfileData());

      act(() => {
        result.current.onNewPasswordChange({
          target: { value: 'newpass123' },
        } as React.ChangeEvent<HTMLInputElement>);
        result.current.onConfirmPasswordChange({
          target: { value: 'newpass123' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      await act(async () => {
        await result.current.onPasswordSubmit(mockEvent);
      });

      expect(result.current.newPassword).toBe('');
      expect(result.current.confirmPassword).toBe('');
      expect(result.current.passwordSaving).toBe(false);
    });

    it('shows error toast when updatePassword returns an error', async () => {
      mockUpdatePassword.mockResolvedValueOnce({
        error: { message: 'Invalid password' },
      });
      const { result } = renderHook(() => useProfileData());

      act(() => {
        result.current.onNewPasswordChange({
          target: { value: 'newpass123' },
        } as React.ChangeEvent<HTMLInputElement>);
        result.current.onConfirmPasswordChange({
          target: { value: 'newpass123' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      await act(async () => {
        await result.current.onPasswordSubmit(mockEvent);
      });

      expect(mockShowError).toHaveBeenCalledWith('Invalid password');
      expect(result.current.passwordSaving).toBe(false);
    });

    it('shows error toast when updatePassword throws', async () => {
      mockUpdatePassword.mockRejectedValueOnce(new Error('network error'));
      const { result } = renderHook(() => useProfileData());

      act(() => {
        result.current.onNewPasswordChange({
          target: { value: 'newpass123' },
        } as React.ChangeEvent<HTMLInputElement>);
        result.current.onConfirmPasswordChange({
          target: { value: 'newpass123' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      await act(async () => {
        await result.current.onPasswordSubmit(mockEvent);
      });

      expect(mockShowError).toHaveBeenCalledWith('Failed to change password.');
      expect(result.current.passwordSaving).toBe(false);
    });
  });
});
