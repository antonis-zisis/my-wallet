import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildSubscriptionsSubtitle } from './buildSubscriptionsSubtitle';

describe('buildSubscriptionsSubtitle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the marketing line when there are no active subscriptions', () => {
    const result = buildSubscriptionsSubtitle(0, null);

    expect(result).toBe('Track recurring payments in one place.');
  });

  it('uses the singular noun for exactly one active subscription with no renewal', () => {
    const result = buildSubscriptionsSubtitle(1, null);

    expect(result).toBe('1 active subscription');
  });

  it('uses the plural noun for many active subscriptions with no renewal', () => {
    const result = buildSubscriptionsSubtitle(4, null);

    expect(result).toBe('4 active subscriptions');
  });

  it('reports "next renewal today" when the renewal date is today', () => {
    const result = buildSubscriptionsSubtitle(
      3,
      new Date('2026-04-15T00:00:00Z')
    );

    expect(result).toBe('3 active subscriptions · next renewal today');
  });

  it('reports "next renewal tomorrow" when the renewal date is tomorrow', () => {
    const result = buildSubscriptionsSubtitle(
      3,
      new Date('2026-04-16T00:00:00Z')
    );

    expect(result).toBe('3 active subscriptions · next renewal tomorrow');
  });

  it('reports "next renewal in N days" when the renewal is further out', () => {
    const result = buildSubscriptionsSubtitle(
      3,
      new Date('2026-04-30T00:00:00Z')
    );

    expect(result).toBe('3 active subscriptions · next renewal in 15 days');
  });
});
