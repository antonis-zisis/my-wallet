import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDebouncedValue } from './useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('first', 300));

    expect(result.current).toBe('first');
  });

  it('updates to the latest value only after the delay elapses', () => {
    const { rerender, result } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: 'first' } }
    );

    rerender({ value: 'second' });

    expect(result.current).toBe('first');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('second');
  });

  it('keeps only the final value when changes arrive faster than the delay', () => {
    const { rerender, result } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'ab' });
    act(() => vi.advanceTimersByTime(100));
    rerender({ value: 'abc' });
    act(() => vi.advanceTimersByTime(100));

    expect(result.current).toBe('a');

    act(() => vi.advanceTimersByTime(300));

    expect(result.current).toBe('abc');
  });
});
