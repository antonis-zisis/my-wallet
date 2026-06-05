import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { daysSince, formatStaleness } from './formatStaleness';

describe('daysSince', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns 0 for today', () => {
    expect(daysSince('2026-06-15T00:00:00.000Z')).toBe(0);
  });

  it('returns the integer day count for a past ISO date', () => {
    expect(daysSince('2026-06-08T00:00:00.000Z')).toBe(7);
  });

  it('accepts numeric millisecond timestamp strings', () => {
    const sevenDaysAgo = String(new Date('2026-06-08T00:00:00.000Z').getTime());

    expect(daysSince(sevenDaysAgo)).toBe(7);
  });

  it('returns 0 for unparseable input', () => {
    expect(daysSince('not-a-date')).toBe(0);
  });

  it('returns 0 (not negative) for a future date', () => {
    expect(daysSince('2026-12-01T00:00:00.000Z')).toBe(0);
  });
});

describe('formatStaleness', () => {
  it('returns "today" for 0 days', () => {
    expect(formatStaleness(0)).toBe('Last updated today');
  });

  it('returns "yesterday" for 1 day', () => {
    expect(formatStaleness(1)).toBe('Last updated yesterday');
  });

  it('returns "N days ago" for any other day count', () => {
    expect(formatStaleness(7)).toBe('Last updated 7 days ago');
    expect(formatStaleness(46)).toBe('Last updated 46 days ago');
  });
});
