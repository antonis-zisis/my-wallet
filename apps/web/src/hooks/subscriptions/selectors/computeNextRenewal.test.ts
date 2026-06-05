import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { makeSubscription } from '../../../test/fixtures/subscription';
import { computeNextRenewal } from './computeNextRenewal';

describe('computeNextRenewal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-15T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null when there are no subscriptions', () => {
    const result = computeNextRenewal([]);

    expect(result).toBeNull();
  });

  it('returns the soonest upcoming renewal among active subscriptions', () => {
    const result = computeNextRenewal([
      makeSubscription({
        id: '1',
        name: 'Netflix',
        amount: 15.99,
        billingCycle: 'MONTHLY',
        startDate: '2025-04-28T00:00:00.000Z',
      }),
      makeSubscription({
        id: '2',
        name: 'Adobe',
        amount: 120,
        billingCycle: 'YEARLY',
        startDate: '2025-06-15T00:00:00.000Z',
      }),
    ]);

    expect(result?.name).toBe('Netflix');
    expect(result?.amount).toBe(15.99);
  });

  it('excludes cancelled subscriptions from consideration', () => {
    const result = computeNextRenewal([
      makeSubscription({
        id: '1',
        name: 'Netflix',
        cancelledAt: '2026-04-01T00:00:00.000Z',
        endDate: '2026-04-30T00:00:00.000Z',
      }),
      makeSubscription({
        id: '2',
        name: 'Adobe',
        startDate: '2025-05-01T00:00:00.000Z',
      }),
    ]);

    expect(result?.name).toBe('Adobe');
  });

  it('excludes active trial subscriptions from consideration', () => {
    const result = computeNextRenewal([
      makeSubscription({
        id: '1',
        name: 'Notion',
        trialEndsAt: '2030-01-01T00:00:00.000Z',
      }),
      makeSubscription({
        id: '2',
        name: 'Adobe',
        startDate: '2025-05-01T00:00:00.000Z',
      }),
    ]);

    expect(result?.name).toBe('Adobe');
  });
});
