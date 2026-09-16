import { act, renderHook } from '@testing-library/react';
import type { ChangeEvent, SubmitEvent } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSignUpForm } from './useSignUpForm';

const mockSignUp = vi.fn();

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({
    signUp: (...args: Array<unknown>) => mockSignUp(...args),
  }),
}));

const mockEvent = { preventDefault: vi.fn() } as unknown as SubmitEvent;

const changeEvent = (value: string) =>
  ({ target: { value } }) as ChangeEvent<HTMLInputElement>;

const fillForm = (
  result: { current: ReturnType<typeof useSignUpForm> },
  email: string,
  password: string,
  confirmPassword: string
) => {
  act(() => result.current.onEmailChange(changeEvent(email)));
  act(() => result.current.onPasswordChange(changeEvent(password)));
  act(() =>
    result.current.onConfirmPasswordChange(changeEvent(confirmPassword))
  );
};

beforeEach(() => {
  mockSignUp.mockReset();
  mockSignUp.mockResolvedValue({ error: null, needsEmailConfirmation: true });
});

describe('useSignUpForm', () => {
  it('starts empty with nothing submitted', () => {
    const { result } = renderHook(() => useSignUpForm());

    expect(result.current.email).toBe('');
    expect(result.current.isFormEmpty).toBe(true);
    expect(result.current.isAwaitingConfirmation).toBe(false);
  });

  it('registers the trimmed address and waits for confirmation', async () => {
    const { result } = renderHook(() => useSignUpForm());

    fillForm(result, '  user@example.com ', 'password', 'password');
    await act(async () => {
      await result.current.onSubmit(mockEvent);
    });

    expect(mockSignUp).toHaveBeenCalledWith('user@example.com', 'password');
    expect(result.current.isAwaitingConfirmation).toBe(true);
  });

  it('keeps the form submitting when the account is usable right away', async () => {
    mockSignUp.mockResolvedValue({
      error: null,
      needsEmailConfirmation: false,
    });

    const { result } = renderHook(() => useSignUpForm());

    fillForm(result, 'user@example.com', 'password', 'password');
    await act(async () => {
      await result.current.onSubmit(mockEvent);
    });

    expect(result.current.isAwaitingConfirmation).toBe(false);
    expect(result.current.submitting).toBe(true);
  });

  it('rejects mismatched passwords without contacting the server', async () => {
    const { result } = renderHook(() => useSignUpForm());

    fillForm(result, 'user@example.com', 'password', 'different');
    await act(async () => {
      await result.current.onSubmit(mockEvent);
    });

    expect(result.current.error).toBe('Passwords do not match.');
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('surfaces the failure when sign-up is rejected', async () => {
    mockSignUp.mockResolvedValue({
      error: new Error('User already registered'),
      needsEmailConfirmation: false,
    });

    const { result } = renderHook(() => useSignUpForm());

    fillForm(result, 'user@example.com', 'password', 'password');
    await act(async () => {
      await result.current.onSubmit(mockEvent);
    });

    expect(result.current.error).toBe('User already registered');
    expect(result.current.isAwaitingConfirmation).toBe(false);
    expect(result.current.submitting).toBe(false);
  });
});
