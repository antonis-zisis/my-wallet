import { describe, expect, it } from 'vitest';

import { startOfMonthWindow } from './startOfMonthWindow';

describe('startOfMonthWindow', () => {
  it('returns the first day of the current month for a single-month window', () => {
    const result = startOfMonthWindow(new Date('2026-08-26T14:30:00.000Z'), 1);

    expect(result.toISOString()).toBe('2026-08-01T00:00:00.000Z');
  });

  it('counts the current month as part of the window', () => {
    const result = startOfMonthWindow(new Date('2026-08-26T00:00:00.000Z'), 3);

    expect(result.toISOString()).toBe('2026-06-01T00:00:00.000Z');
  });

  it('rolls back across a year boundary', () => {
    const result = startOfMonthWindow(new Date('2026-02-10T00:00:00.000Z'), 6);

    expect(result.toISOString()).toBe('2025-09-01T00:00:00.000Z');
  });
});
