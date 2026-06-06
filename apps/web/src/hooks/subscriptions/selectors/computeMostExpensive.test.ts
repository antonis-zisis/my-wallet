import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { makeSubscription } from '../../../test/fixtures/subscription';
import { computeMostExpensive } from './computeMostExpensive';

describe('computeMostExpensive', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-15T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null for an empty list', () => {
    const result = computeMostExpensive([]);

    expect(result).toBeNull();
  });

  it('returns the subscription with the highest monthly cost', () => {
    const result = computeMostExpensive([
      makeSubscription({ id: '1', name: 'Netflix', monthlyCost: 15.99 }),
      makeSubscription({ id: '2', name: 'Spotify', monthlyCost: 9.99 }),
      makeSubscription({ id: '3', name: 'Adobe', monthlyCost: 19.99 }),
    ]);

    expect(result).toEqual({ name: 'Adobe', monthlyCost: 19.99 });
  });

  it('excludes active trial subscriptions', () => {
    const result = computeMostExpensive([
      makeSubscription({ id: '1', name: 'Netflix', monthlyCost: 15.99 }),
      makeSubscription({
        id: '2',
        name: 'Notion Trial',
        monthlyCost: 50,
        trialEndsAt: '2030-01-01T00:00:00.000Z',
      }),
    ]);

    expect(result?.name).toBe('Netflix');
  });

  it('excludes cancelled subscriptions', () => {
    const result = computeMostExpensive([
      makeSubscription({ id: '1', name: 'Netflix', monthlyCost: 15.99 }),
      makeSubscription({
        id: '2',
        name: 'Adobe',
        monthlyCost: 50,
        cancelledAt: '2026-04-01T00:00:00.000Z',
        endDate: '2026-04-30T00:00:00.000Z',
      }),
    ]);

    expect(result?.name).toBe('Netflix');
  });
});
