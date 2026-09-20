import { describe, expect, it } from 'vitest';

import { clampWindowToPlan } from './clampWindowToPlan';

describe('clampWindowToPlan', () => {
  it('keeps the chosen window when the plan has no ceiling', () => {
    expect(clampWindowToPlan(12, null)).toBe(12);
  });

  it('keeps the chosen window when it fits the ceiling', () => {
    expect(clampWindowToPlan(3, 3)).toBe(3);
  });

  it('falls back to the widest allowed window when the choice is too wide', () => {
    expect(clampWindowToPlan(12, 3)).toBe(3);
  });

  it('falls back to the narrowest window when no option fits', () => {
    expect(clampWindowToPlan(12, 1)).toBe(3);
  });
});
