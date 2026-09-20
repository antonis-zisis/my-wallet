import { describe, expect, it } from 'vitest';

import { buildPlanCta } from './buildPlanCta';

describe('buildPlanCta', () => {
  it('marks the plan the user is already on', () => {
    expect(
      buildPlanCta({
        currentPlan: 'FREE',
        isCheckoutAvailable: true,
        plan: 'FREE',
      })
    ).toEqual({ action: 'CURRENT', label: 'Current plan' });
  });

  it('offers checkout to a first-time visitor', () => {
    expect(
      buildPlanCta({
        currentPlan: null,
        isCheckoutAvailable: true,
        plan: 'PRO',
      })
    ).toEqual({ action: 'CHECKOUT', label: 'Start with Pro' });
  });

  it('offers an upgrade to someone on Free', () => {
    expect(
      buildPlanCta({
        currentPlan: 'FREE',
        isCheckoutAvailable: true,
        plan: 'PRO',
      })
    ).toEqual({ action: 'CHECKOUT', label: 'Upgrade to Pro' });
  });

  it('routes a subscriber downgrading through the billing portal', () => {
    expect(
      buildPlanCta({
        currentPlan: 'PRO',
        isCheckoutAvailable: true,
        plan: 'FREE',
      })
    ).toEqual({ action: 'PORTAL', label: 'Cancel in billing portal' });
  });

  it('lets someone who has never paid pick Free directly', () => {
    expect(
      buildPlanCta({
        currentPlan: null,
        isCheckoutAvailable: true,
        plan: 'FREE',
      })
    ).toEqual({ action: 'SELECT_FREE', label: 'Start with Free' });
  });

  it('withholds Pro when billing is not configured', () => {
    expect(
      buildPlanCta({
        currentPlan: 'FREE',
        isCheckoutAvailable: false,
        plan: 'PRO',
      })
    ).toEqual({ action: 'UNAVAILABLE', label: 'Not available yet' });
  });
});
