import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the initial value when nothing is stored', () => {
    const { result } = renderHook(() => useLocalStorage('key', 42));

    expect(result.current[0]).toBe(42);
  });

  it('returns the stored value when localStorage already has a value', () => {
    localStorage.setItem('key', JSON.stringify(99));

    const { result } = renderHook(() => useLocalStorage('key', 42));

    expect(result.current[0]).toBe(99);
  });

  it('persists a new value to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('key', 0));

    act(() => {
      result.current[1](7);
    });

    expect(result.current[0]).toBe(7);
    expect(JSON.parse(localStorage.getItem('key')!)).toBe(7);
  });

  it('supports an updater function', () => {
    const { result } = renderHook(() => useLocalStorage('key', 1));

    act(() => {
      result.current[1]((previous) => previous + 1);
    });

    expect(result.current[0]).toBe(2);
    expect(JSON.parse(localStorage.getItem('key')!)).toBe(2);
  });

  it('falls back to the initial value when localStorage contains invalid JSON', () => {
    localStorage.setItem('key', 'not-valid-json{{{');

    const { result } = renderHook(() => useLocalStorage('key', 'fallback'));

    expect(result.current[0]).toBe('fallback');
  });

  it('keeps state in memory when localStorage write fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    const { result } = renderHook(() => useLocalStorage('key', 'initial'));

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
  });

  it('works with object values', () => {
    const initial = { isOpen: true, limit: 12 };
    const { result } = renderHook(() => useLocalStorage('key', initial));

    act(() => {
      result.current[1]({ isOpen: false, limit: 6 });
    });

    expect(result.current[0]).toEqual({ isOpen: false, limit: 6 });
    expect(JSON.parse(localStorage.getItem('key')!)).toEqual({
      isOpen: false,
      limit: 6,
    });
  });
});
