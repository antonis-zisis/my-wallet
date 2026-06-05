import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getNextRenewalDate } from './getNextRenewalDate';

function localParts(date: Date) {
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
  };
}

describe('getNextRenewalDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 15, 12));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('rolls a monthly subscription forward to the next month after today', () => {
    const result = getNextRenewalDate(new Date(2025, 0, 1), 'MONTHLY');

    expect(localParts(result)).toEqual({ year: 2026, month: 4, day: 1 });
  });

  it('rolls a yearly subscription forward to the next anniversary', () => {
    const result = getNextRenewalDate(new Date(2025, 2, 1), 'YEARLY');

    expect(localParts(result)).toEqual({ year: 2027, month: 2, day: 1 });
  });

  it('rolls a quarterly subscription forward in 3-month increments', () => {
    const result = getNextRenewalDate(new Date(2025, 0, 10), 'QUARTERLY');

    expect(localParts(result)).toEqual({ year: 2026, month: 6, day: 10 });
  });

  it('rolls a bi-annual subscription forward in 6-month increments', () => {
    const result = getNextRenewalDate(new Date(2025, 3, 1), 'BI_ANNUAL');

    expect(localParts(result)).toEqual({ year: 2026, month: 9, day: 1 });
  });

  it('rolls a weekly subscription forward in 7-day increments', () => {
    const result = getNextRenewalDate(new Date(2026, 3, 8), 'WEEKLY');

    expect(localParts(result)).toEqual({ year: 2026, month: 3, day: 22 });
  });

  it('returns the same date when startDate is in the future for monthly', () => {
    const result = getNextRenewalDate(new Date(2026, 11, 1), 'MONTHLY');

    expect(localParts(result)).toEqual({ year: 2026, month: 11, day: 1 });
  });
});
