import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { makeSubscription } from '../../../test/fixtures/subscription';
import { computeRenewingThisMonthTotal } from './computeRenewingThisMonthTotal';

describe('computeRenewingThisMonthTotal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-15'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns 0 for an empty list', () => {
    const result = computeRenewingThisMonthTotal([]);

    expect(result).toBe(0);
  });

  it('counts a monthly subscription every month', () => {
    const result = computeRenewingThisMonthTotal([
      makeSubscription({ amount: 15.99, billingCycle: 'MONTHLY' }),
    ]);

    expect(result).toBeCloseTo(15.99);
  });

  it('counts a yearly subscription only in its anniversary month', () => {
    const offCycle = makeSubscription({
      amount: 120,
      billingCycle: 'YEARLY',
      startDate: '2025-03-01T00:00:00.000Z',
    });
    const onCycle = makeSubscription({
      id: '2',
      amount: 120,
      billingCycle: 'YEARLY',
      startDate: '2025-04-01T00:00:00.000Z',
    });

    expect(computeRenewingThisMonthTotal([offCycle])).toBe(0);
    expect(computeRenewingThisMonthTotal([onCycle])).toBe(120);
  });

  it('counts a quarterly subscription only when the month aligns', () => {
    const onCycle = makeSubscription({
      amount: 30,
      billingCycle: 'QUARTERLY',
      startDate: '2025-01-10T00:00:00.000Z',
    });
    const offCycle = makeSubscription({
      id: '2',
      amount: 30,
      billingCycle: 'QUARTERLY',
      startDate: '2025-02-10T00:00:00.000Z',
    });

    expect(computeRenewingThisMonthTotal([onCycle])).toBe(30);
    expect(computeRenewingThisMonthTotal([offCycle])).toBe(0);
  });

  it('counts a bi-annual subscription only when the month aligns', () => {
    const onCycle = makeSubscription({
      amount: 60,
      billingCycle: 'BI_ANNUAL',
      startDate: '2025-10-01T00:00:00.000Z',
    });
    const offCycle = makeSubscription({
      id: '2',
      amount: 60,
      billingCycle: 'BI_ANNUAL',
      startDate: '2025-01-01T00:00:00.000Z',
    });

    expect(computeRenewingThisMonthTotal([onCycle])).toBe(60);
    expect(computeRenewingThisMonthTotal([offCycle])).toBe(0);
  });

  it('counts every weekly renewal that lands in the month', () => {
    // Wednesday start: April 2026 has Wednesdays on 1, 8, 15, 22, 29 → 5
    const wednesdayWeekly = makeSubscription({
      amount: 5,
      billingCycle: 'WEEKLY',
      startDate: '2026-01-07T00:00:00.000Z',
    });
    // Monday start: April 2026 has Mondays on 6, 13, 20, 27 → 4
    const mondayWeekly = makeSubscription({
      id: '2',
      amount: 5,
      billingCycle: 'WEEKLY',
      startDate: '2026-01-05T00:00:00.000Z',
    });

    expect(computeRenewingThisMonthTotal([wednesdayWeekly])).toBe(25);
    expect(computeRenewingThisMonthTotal([mondayWeekly])).toBe(20);
  });

  it('excludes active trial subscriptions', () => {
    const result = computeRenewingThisMonthTotal([
      makeSubscription({ amount: 15.99, billingCycle: 'MONTHLY' }),
      makeSubscription({
        id: '2',
        amount: 50,
        billingCycle: 'MONTHLY',
        trialEndsAt: '2030-01-01T00:00:00.000Z',
      }),
    ]);

    expect(result).toBeCloseTo(15.99);
  });

  it('excludes cancelled subscriptions', () => {
    const result = computeRenewingThisMonthTotal([
      makeSubscription({ amount: 15.99, billingCycle: 'MONTHLY' }),
      makeSubscription({
        id: '2',
        amount: 50,
        billingCycle: 'MONTHLY',
        cancelledAt: '2026-04-01T00:00:00.000Z',
        endDate: '2026-04-30T00:00:00.000Z',
      }),
    ]);

    expect(result).toBeCloseTo(15.99);
  });
});
