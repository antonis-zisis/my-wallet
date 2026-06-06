import { describe, expect, it } from 'vitest';

import { computeMonthlyCost } from './computeMonthlyCost';

describe('computeMonthlyCost', () => {
  it('returns amount as-is for monthly subscriptions', () => {
    const result = computeMonthlyCost({
      amount: 15.99,
      billingCycle: 'MONTHLY',
    });

    expect(result).toBe(15.99);
  });

  it('returns amount / 12 for yearly subscriptions', () => {
    const result = computeMonthlyCost({ amount: 120, billingCycle: 'YEARLY' });

    expect(result).toBe(10);
  });

  it('returns amount * (52/12) for weekly subscriptions', () => {
    const result = computeMonthlyCost({ amount: 10, billingCycle: 'WEEKLY' });

    expect(result).toBeCloseTo((10 * 52) / 12);
  });

  it('returns amount / 3 for quarterly subscriptions', () => {
    const result = computeMonthlyCost({
      amount: 30,
      billingCycle: 'QUARTERLY',
    });

    expect(result).toBe(10);
  });

  it('returns amount / 6 for bi-annual subscriptions', () => {
    const result = computeMonthlyCost({
      amount: 60,
      billingCycle: 'BI_ANNUAL',
    });

    expect(result).toBe(10);
  });
});
