import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { isActiveTrial } from './isActiveTrial';

describe('isActiveTrial', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns false when trialEndsAt is null', () => {
    expect(isActiveTrial({ trialEndsAt: null })).toBe(false);
  });

  it('returns true when the ISO trial end date is in the future', () => {
    expect(isActiveTrial({ trialEndsAt: '2026-06-15T00:00:00.000Z' })).toBe(
      true
    );
  });

  it('returns false when the ISO trial end date is in the past', () => {
    expect(isActiveTrial({ trialEndsAt: '2026-05-01T00:00:00.000Z' })).toBe(
      false
    );
  });

  it('treats a numeric string as a millisecond timestamp', () => {
    const futureTimestamp = String(
      new Date('2026-07-01T00:00:00.000Z').getTime()
    );

    expect(isActiveTrial({ trialEndsAt: futureTimestamp })).toBe(true);
  });
});
