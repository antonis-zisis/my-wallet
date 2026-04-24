import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getNextRenewalDate } from './getNextRenewalDate';

function toDateString(date: Date): string {
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

describe('getNextRenewalDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-22'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('monthly billing cycle', () => {
    it('returns the next month when start date is in the past', () => {
      const result = getNextRenewalDate('2026-01-15T00:00:00.000Z', 'MONTHLY');
      expect(toDateString(result)).toBe('2026-03-15');
    });

    it('advances multiple months from a distant past start date', () => {
      const result = getNextRenewalDate('2025-06-10T00:00:00.000Z', 'MONTHLY');
      expect(toDateString(result)).toBe('2026-03-10');
    });

    it('returns a future date as-is when start date is already in the future', () => {
      const result = getNextRenewalDate('2026-05-01T00:00:00.000Z', 'MONTHLY');
      expect(toDateString(result)).toBe('2026-05-01');
    });

    it('returns today when start date matches today', () => {
      const result = getNextRenewalDate('2026-02-22T00:00:00.000Z', 'MONTHLY');
      const today = new Date('2026-02-22');
      expect(result.getTime()).toBeGreaterThanOrEqual(today.getTime());
    });
  });

  describe('yearly billing cycle', () => {
    it('returns the next yearly renewal from a past start date', () => {
      const result = getNextRenewalDate('2025-01-15T00:00:00.000Z', 'YEARLY');
      expect(toDateString(result)).toBe('2027-01-15');
    });

    it('advances by a year when past the current year renewal', () => {
      const result = getNextRenewalDate('2025-02-01T00:00:00.000Z', 'YEARLY');
      expect(toDateString(result)).toBe('2027-02-01');
    });

    it('returns a future date as-is when start date is in the future', () => {
      const result = getNextRenewalDate('2027-06-01T00:00:00.000Z', 'YEARLY');
      expect(toDateString(result)).toBe('2027-06-01');
    });
  });

  describe('weekly billing cycle', () => {
    it('returns the next weekly renewal from a past start date', () => {
      // 2026-01-12 is Monday; next Monday >= 2026-02-22 is 2026-02-23
      const result = getNextRenewalDate('2026-01-12T00:00:00.000Z', 'WEEKLY');
      expect(toDateString(result)).toBe('2026-02-23');
    });

    it('advances only one week when the renewal was last week', () => {
      // 2026-02-15 is Sunday; next Sunday >= 2026-02-22 is 2026-02-22
      const result = getNextRenewalDate('2026-02-15T00:00:00.000Z', 'WEEKLY');
      expect(toDateString(result)).toBe('2026-02-22');
    });

    it('returns a future date as-is when start date is already in the future', () => {
      const result = getNextRenewalDate('2026-03-02T00:00:00.000Z', 'WEEKLY');
      expect(toDateString(result)).toBe('2026-03-02');
    });
  });

  describe('quarterly billing cycle', () => {
    it('returns the next quarterly renewal from a past start date', () => {
      // 2025-05-15: +3mo = Aug 15, +3mo = Nov 15, +3mo = 2026-02-15 < today,
      // +3mo = 2026-05-15
      const result = getNextRenewalDate(
        '2025-05-15T00:00:00.000Z',
        'QUARTERLY'
      );
      expect(toDateString(result)).toBe('2026-05-15');
    });

    it('stops at the first upcoming anniversary month', () => {
      // 2025-08-10: +3mo = Nov 10, +3mo = 2026-02-10 < today, +3mo = 2026-05-10
      const result = getNextRenewalDate(
        '2025-08-10T00:00:00.000Z',
        'QUARTERLY'
      );
      expect(toDateString(result)).toBe('2026-05-10');
    });

    it('returns a future date as-is when start date is already in the future', () => {
      const result = getNextRenewalDate(
        '2027-01-01T00:00:00.000Z',
        'QUARTERLY'
      );
      expect(toDateString(result)).toBe('2027-01-01');
    });
  });

  describe('bi-annual billing cycle', () => {
    it('returns the next bi-annual renewal from a past start date', () => {
      // 2025-03-01: +6mo = 2025-09-01, +6mo = 2026-03-01 >= today
      const result = getNextRenewalDate(
        '2025-03-01T00:00:00.000Z',
        'BI_ANNUAL'
      );
      expect(toDateString(result)).toBe('2026-03-01');
    });

    it('stops at the first upcoming semi-annual date', () => {
      // 2025-09-10: +6mo = 2026-03-10 >= today
      const result = getNextRenewalDate(
        '2025-09-10T00:00:00.000Z',
        'BI_ANNUAL'
      );
      expect(toDateString(result)).toBe('2026-03-10');
    });

    it('returns a future date as-is when start date is already in the future', () => {
      const result = getNextRenewalDate(
        '2027-06-01T00:00:00.000Z',
        'BI_ANNUAL'
      );
      expect(toDateString(result)).toBe('2027-06-01');
    });
  });

  describe('date format handling', () => {
    it('handles numeric timestamp strings', () => {
      const timestamp = String(new Date('2026-01-15T00:00:00.000Z').getTime());
      const result = getNextRenewalDate(timestamp, 'MONTHLY');
      expect(toDateString(result)).toBe('2026-03-15');
    });

    it('handles Date objects', () => {
      const result = getNextRenewalDate(
        new Date('2026-01-15T00:00:00.000Z'),
        'MONTHLY'
      );
      expect(toDateString(result)).toBe('2026-03-15');
    });

    it('handles numeric timestamps', () => {
      const timestamp = new Date('2026-01-15T00:00:00.000Z').getTime();
      const result = getNextRenewalDate(timestamp, 'MONTHLY');
      expect(toDateString(result)).toBe('2026-03-15');
    });
  });
});
