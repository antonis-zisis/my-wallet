import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { formatRelativeTime } from './formatRelativeTime';

const NOW = '2025-04-05T12:00:00.000Z';

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(NOW));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for dates less than a minute ago', () => {
    expect(formatRelativeTime('2025-04-05T11:59:30.000Z')).toBe('just now');
  });

  it('returns "1 minute ago" for exactly 1 minute ago', () => {
    expect(formatRelativeTime('2025-04-05T11:59:00.000Z')).toBe('1 minute ago');
  });

  it('returns "X minutes ago" for less than 60 minutes ago', () => {
    expect(formatRelativeTime('2025-04-05T11:30:00.000Z')).toBe(
      '30 minutes ago'
    );
  });

  it('returns "1 hour ago" for exactly 1 hour ago', () => {
    expect(formatRelativeTime('2025-04-05T11:00:00.000Z')).toBe('1 hour ago');
  });

  it('returns "X hours ago" for less than 24 hours ago', () => {
    expect(formatRelativeTime('2025-04-05T06:00:00.000Z')).toBe('6 hours ago');
  });

  it('returns "yesterday" for 1 day ago', () => {
    expect(formatRelativeTime('2025-04-04T12:00:00.000Z')).toBe('yesterday');
  });

  it('returns "X days ago" for less than 30 days ago', () => {
    expect(formatRelativeTime('2025-03-26T12:00:00.000Z')).toBe('10 days ago');
  });

  it('returns formatted date for dates older than 30 days', () => {
    expect(formatRelativeTime('2025-01-01T12:00:00.000Z')).toBe('Jan 1, 2025');
  });

  it('accepts a Date object as input', () => {
    expect(formatRelativeTime(new Date('2025-04-05T11:59:30.000Z'))).toBe(
      'just now'
    );
  });

  it('accepts a numeric timestamp as input', () => {
    expect(
      formatRelativeTime(new Date('2025-04-05T11:59:30.000Z').getTime())
    ).toBe('just now');
  });

  it('does not throw for an invalid date string', () => {
    expect(() => formatRelativeTime('not-a-date')).not.toThrow();
  });
});
