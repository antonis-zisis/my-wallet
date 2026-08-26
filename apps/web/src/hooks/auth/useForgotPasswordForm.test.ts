import { act, renderHook } from '@testing-library/react';
import type { ChangeEvent, SubmitEvent } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useForgotPasswordForm } from './useForgotPasswordForm';

const mockSendPasswordResetEmail = vi.fn();

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({
    sendPasswordResetEmail: (...args: Array<unknown>) =>
      mockSendPasswordResetEmail(...args),
  }),
}));

const mockEvent = { preventDefault: vi.fn() } as unknown as SubmitEvent;

const changeEvent = (value: string) =>
  ({ target: { value } }) as ChangeEvent<HTMLInputElement>;

beforeEach(() => {
  mockSendPasswordResetEmail.mockReset();
  mockSendPasswordResetEmail.mockResolvedValue({ error: null });
});

describe('useForgotPasswordForm', () => {
  it('starts with an empty email and nothing sent', () => {
    const { result } = renderHook(() => useForgotPasswordForm());

    expect(result.current.email).toBe('');
    expect(result.current.isSent).toBe(false);
    expect(result.current.isEmailEmpty).toBe(true);
  });

  it('sends the reset email to the trimmed address on submit', async () => {
    const { result } = renderHook(() => useForgotPasswordForm());

    act(() => result.current.onEmailChange(changeEvent('  user@example.com ')));
    await act(async () => {
      await result.current.onSubmit(mockEvent);
    });

    expect(mockSendPasswordResetEmail).toHaveBeenCalledWith('user@example.com');
    expect(result.current.isSent).toBe(true);
  });

  it('shows the same confirmation when the request fails', async () => {
    mockSendPasswordResetEmail.mockResolvedValue({
      error: new Error('User not found'),
    });

    const { result } = renderHook(() => useForgotPasswordForm());

    act(() => result.current.onEmailChange(changeEvent('user@example.com')));
    await act(async () => {
      await result.current.onSubmit(mockEvent);
    });

    expect(result.current.isSent).toBe(true);
  });
});
