import { describe, expect, it } from 'vitest';

import { toDateInputValue } from './toDateInputValue';

describe('toDateInputValue', () => {
  it('formats a UTC ISO string as YYYY-MM-DD', () => {
    expect(toDateInputValue('2026-01-15T00:00:00.000Z')).toBe('2026-01-15');
  });

  it('pads single-digit months and days', () => {
    expect(toDateInputValue('2026-03-05T12:00:00.000Z')).toBe('2026-03-05');
  });

  it('uses the UTC date even when the local timezone would shift the day', () => {
    expect(toDateInputValue('2026-06-15T23:30:00.000Z')).toBe('2026-06-15');
  });
});
