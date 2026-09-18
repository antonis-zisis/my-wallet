import { describe, expect, it } from 'vitest';

import { OnboardingProgress } from '../../../types/onboarding';
import { buildOnboardingSteps } from './buildOnboardingSteps';

const NOTHING_DONE: OnboardingProgress = {
  hasContract: false,
  hasFullName: false,
  hasNetWorthSnapshot: false,
  hasSubscription: false,
  hasTransaction: false,
};

describe('buildOnboardingSteps', () => {
  it('returns every step unfinished for a new user', () => {
    const steps = buildOnboardingSteps(NOTHING_DONE);

    expect(steps.map((step) => step.id)).toEqual([
      'transaction',
      'subscription',
      'contract',
      'netWorth',
    ]);
    expect(steps.every((step) => !step.isDone)).toBe(true);
  });

  it('marks the steps the user has already done', () => {
    const steps = buildOnboardingSteps({
      ...NOTHING_DONE,
      hasSubscription: true,
      hasTransaction: true,
    });

    expect(steps.filter((step) => step.isDone).map((step) => step.id)).toEqual([
      'transaction',
      'subscription',
    ]);
  });

  it('links each step to its create flow', () => {
    const steps = buildOnboardingSteps(NOTHING_DONE);

    expect(steps.map((step) => step.to)).toEqual([
      '/reports?new=1',
      '/subscriptions?new=1',
      '/contracts?new=1',
      '/net-worth?new=1',
    ]);
  });
});
