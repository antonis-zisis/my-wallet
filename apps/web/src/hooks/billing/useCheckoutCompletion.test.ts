import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  refetchUser: vi.fn(),
  user: null as unknown,
}));

vi.mock('../../contexts/UserContext', () => ({
  useUser: () => ({
    loading: false,
    refetchUser: state.refetchUser,
    updateUser: vi.fn(),
    user: state.user,
  }),
}));

import { makeUser } from '../../test/fixtures';
import { useCheckoutCompletion } from './useCheckoutCompletion';

beforeEach(() => {
  state.refetchUser.mockReset();
  state.user = makeUser({ plan: 'FREE' });
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useCheckoutCompletion', () => {
  it('does nothing when the user did not come back from checkout', () => {
    const { result } = renderHook(() =>
      useCheckoutCompletion({ isReturningFromCheckout: false })
    );

    act(() => vi.advanceTimersByTime(10000));

    expect(result.current.isFinalizing).toBe(false);
    expect(state.refetchUser).not.toHaveBeenCalled();
  });

  it('waits for the plan to catch up after checkout', () => {
    const { result } = renderHook(() =>
      useCheckoutCompletion({ isReturningFromCheckout: true })
    );

    expect(result.current.isFinalizing).toBe(true);

    act(() => vi.advanceTimersByTime(1000));

    expect(state.refetchUser).toHaveBeenCalledTimes(1);
  });

  it('stops polling as soon as the upgrade lands', () => {
    state.user = makeUser({ plan: 'PRO' });

    const { result } = renderHook(() =>
      useCheckoutCompletion({ isReturningFromCheckout: true })
    );

    act(() => vi.advanceTimersByTime(10000));

    expect(result.current.isFinalizing).toBe(false);
    expect(result.current.hasTimedOut).toBe(false);
    expect(state.refetchUser).not.toHaveBeenCalled();
  });

  it('gives up after a bounded number of attempts', () => {
    const { result } = renderHook(() =>
      useCheckoutCompletion({ isReturningFromCheckout: true })
    );

    for (const delay of [1000, 1500, 2500, 4000, 6000]) {
      act(() => vi.advanceTimersByTime(delay));
    }

    expect(state.refetchUser).toHaveBeenCalledTimes(5);
    expect(result.current.isFinalizing).toBe(false);
    expect(result.current.hasTimedOut).toBe(true);
  });
});
