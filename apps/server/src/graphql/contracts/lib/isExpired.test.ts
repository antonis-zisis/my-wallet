import { describe, expect, it } from 'vitest';

import { isExpired } from './isExpired';

describe('isExpired', () => {
  const now = new Date('2026-06-24T00:00:00Z');

  it('returns false when there is no end date', () => {
    const result = isExpired({ endDate: null }, now);

    expect(result).toBe(false);
  });

  it('returns true when the end date is in the past', () => {
    const result = isExpired(
      { endDate: new Date('2026-01-01T00:00:00Z') },
      now
    );

    expect(result).toBe(true);
  });

  it('returns false when the end date is in the future', () => {
    const result = isExpired(
      { endDate: new Date('2027-01-01T00:00:00Z') },
      now
    );

    expect(result).toBe(false);
  });
});
