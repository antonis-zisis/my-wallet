import { describe, expect, it } from 'vitest';

import { formatMonth, formatMonthWithYear } from './formatMonth';

describe('formatMonth', () => {
  it('abbreviates the month name', () => {
    expect(formatMonth('2026-08')).toBe('Aug');
  });

  it('handles the first and last months of the year', () => {
    expect(formatMonth('2026-01')).toBe('Jan');
    expect(formatMonth('2026-12')).toBe('Dec');
  });
});

describe('formatMonthWithYear', () => {
  it('appends a two-digit year', () => {
    expect(formatMonthWithYear('2026-08')).toBe("Aug '26");
  });
});
