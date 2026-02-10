import { describe, expect, it } from 'vitest';

import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('formats a Date object', () => {
    const date = new Date(2025, 5, 15);
    expect(formatDate(date)).toBe('15/06/2025');
  });

  it('formats an ISO string', () => {
    expect(formatDate('2025-01-03T12:00:00Z')).toBe('03/01/2025');
  });

  it('formats a numeric timestamp in milliseconds', () => {
    const timestamp = 1770674898326;
    const expected = formatDate(new Date(timestamp));
    expect(formatDate(timestamp)).toBe(expected);
  });

  it('formats a numeric timestamp passed as a string', () => {
    const timestamp = '1770674898326';
    const expected = formatDate(new Date(Number(timestamp)));
    expect(formatDate(timestamp)).toBe(expected);
  });

  it('pads single-digit day and month with leading zeros', () => {
    const date = new Date(2025, 0, 5);
    expect(formatDate(date)).toBe('05/01/2025');
  });
});
