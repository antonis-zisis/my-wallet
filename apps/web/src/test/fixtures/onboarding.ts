import { MockLink } from '@apollo/client/testing';

import { GET_ONBOARDING } from '../../graphql/user';
import { OnboardingProgress } from '../../types/onboarding';

export function makeOnboardingProgress(
  overrides: Partial<OnboardingProgress> = {}
): OnboardingProgress {
  return {
    hasContract: false,
    hasFullName: false,
    hasNetWorthSnapshot: false,
    hasSubscription: false,
    hasTransaction: false,
    ...overrides,
  };
}

type OnboardingResponseOverrides = {
  onboardingCompletedAt?: string | null;
  progress?: Partial<OnboardingProgress>;
};

export function onboardingResponse({
  onboardingCompletedAt = null,
  progress = {},
}: OnboardingResponseOverrides = {}): MockLink.MockedResponse {
  return {
    request: { query: GET_ONBOARDING },
    result: {
      data: {
        me: {
          id: 'user-1',
          onboardingCompletedAt,
          onboardingProgress: makeOnboardingProgress(progress),
        },
      },
    },
  };
}
