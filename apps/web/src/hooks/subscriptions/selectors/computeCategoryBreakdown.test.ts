import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { makeSubscription } from '../../../test/fixtures/subscription';
import { computeCategoryBreakdown } from './computeCategoryBreakdown';

describe('computeCategoryBreakdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-15T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns an empty list when there are no subscriptions', () => {
    const result = computeCategoryBreakdown([]);

    expect(result).toEqual([]);
  });

  it('sums monthly cost per category, sorted by total descending', () => {
    const result = computeCategoryBreakdown([
      makeSubscription({ id: '1', category: 'Entertainment', monthlyCost: 10 }),
      makeSubscription({ id: '2', category: 'Productivity', monthlyCost: 30 }),
      makeSubscription({ id: '3', category: 'Entertainment', monthlyCost: 5 }),
    ]);

    expect(result).toEqual([
      { category: 'Productivity', total: 30 },
      { category: 'Entertainment', total: 15 },
    ]);
  });

  it('buckets subscriptions with no category as Uncategorized', () => {
    const result = computeCategoryBreakdown([
      makeSubscription({ id: '1', category: null, monthlyCost: 8 }),
    ]);

    expect(result).toEqual([{ category: 'Uncategorized', total: 8 }]);
  });

  it('excludes cancelled and active trial subscriptions', () => {
    const result = computeCategoryBreakdown([
      makeSubscription({ id: '1', category: 'Health', monthlyCost: 20 }),
      makeSubscription({
        id: '2',
        category: 'Health',
        monthlyCost: 50,
        cancelledAt: '2026-04-01T00:00:00.000Z',
        endDate: '2026-04-30T00:00:00.000Z',
      }),
      makeSubscription({
        id: '3',
        category: 'Health',
        monthlyCost: 99,
        trialEndsAt: '2030-01-01T00:00:00.000Z',
      }),
    ]);

    expect(result).toEqual([{ category: 'Health', total: 20 }]);
  });
});
