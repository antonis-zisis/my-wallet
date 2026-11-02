import { describe, expect, it } from 'vitest';

import { getContractDurationLabel } from './getContractDurationLabel';

describe('getContractDurationLabel', () => {
  it.each([
    ['2025-01-01T00:00:00Z', '2026-01-01T00:00:00Z', '1 Year'],
    ['2025-01-01T00:00:00Z', '2027-01-01T00:00:00Z', '2 Years'],
    ['2025-01-01T00:00:00Z', '2025-02-01T00:00:00Z', '1 Month'],
    ['2025-01-01T00:00:00Z', '2025-07-01T00:00:00Z', '6 Months'],
    ['2025-01-01T00:00:00Z', '2026-07-01T00:00:00Z', '18 Months'],
  ])('labels %s to %s as %s', (startDate, endDate, expected) => {
    expect(getContractDurationLabel({ startDate, endDate })).toBe(expected);
  });

  it('treats a term ending the day before its anniversary as a full term', () => {
    const result = getContractDurationLabel({
      startDate: '2025-01-01T00:00:00Z',
      endDate: '2026-12-31T00:00:00Z',
    });

    expect(result).toBe('2 Years');
  });

  it('reads dates serialized as epoch milliseconds', () => {
    const result = getContractDurationLabel({
      startDate: String(Date.UTC(2025, 0, 1)),
      endDate: String(Date.UTC(2026, 0, 1)),
    });

    expect(result).toBe('1 Year');
  });

  it('returns null for an open-ended contract', () => {
    const result = getContractDurationLabel({
      startDate: '2025-01-01T00:00:00Z',
      endDate: null,
    });

    expect(result).toBeNull();
  });

  it('returns null when the start date is unknown', () => {
    const result = getContractDurationLabel({
      startDate: null,
      endDate: '2026-01-01T00:00:00Z',
    });

    expect(result).toBeNull();
  });

  it('returns null for a term shorter than a month', () => {
    const result = getContractDurationLabel({
      startDate: '2025-01-01T00:00:00Z',
      endDate: '2025-01-10T00:00:00Z',
    });

    expect(result).toBeNull();
  });

  it('returns null when a date cannot be parsed', () => {
    const result = getContractDurationLabel({
      startDate: 'not-a-date',
      endDate: '2026-01-01T00:00:00Z',
    });

    expect(result).toBeNull();
  });
});
