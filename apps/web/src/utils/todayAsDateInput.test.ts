import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { todayAsDateInput } from './todayAsDateInput';

describe('todayAsDateInput', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the current date as a YYYY-MM-DD string in local time', () => {
    vi.setSystemTime(new Date(2026, 0, 15, 10, 0, 0));

    expect(todayAsDateInput()).toBe('2026-01-15');
  });

  it('pads single-digit months and days', () => {
    vi.setSystemTime(new Date(2026, 2, 5, 10, 0, 0));

    expect(todayAsDateInput()).toBe('2026-03-05');
  });
});
