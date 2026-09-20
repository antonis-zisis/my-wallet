import { describe, expect, it } from 'vitest';

import { toMonthKey } from './toMonthKey';

describe('toMonthKey', () => {
  it('pads single-digit months', () => {
    expect(toMonthKey(2026, 0)).toBe('2026-01');
  });

  it('rolls a negative month index back into the previous year', () => {
    expect(toMonthKey(2026, -2)).toBe('2025-11');
  });

  it('rolls an overflowing month index into the next year', () => {
    expect(toMonthKey(2026, 12)).toBe('2027-01');
  });
});
