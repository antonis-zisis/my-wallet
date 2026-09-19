import { OnboardingProgress, OnboardingStep } from '../../../types/onboarding';

export function buildOnboardingSteps(
  progress: OnboardingProgress
): Array<OnboardingStep> {
  return [
    {
      actionLabel: 'Add a transaction',
      description:
        'Create a report for the month, then log what came in and what went out.',
      id: 'transaction',
      isDone: progress.hasTransaction,
      label: 'Track your first income and expenses',
      to: '/reports?new=1',
    },
    {
      actionLabel: 'Add a subscription',
      description:
        'See what your recurring bills cost per month and when they renew.',
      id: 'subscription',
      isDone: progress.hasSubscription,
      label: 'Add a subscription',
      to: '/subscriptions?new=1',
    },
    {
      actionLabel: 'Add a contract',
      description:
        'Get a heads-up before a contract you are tied into expires.',
      id: 'contract',
      isDone: progress.hasContract,
      label: 'Add a contract',
      to: '/contracts?new=1',
    },
    {
      actionLabel: 'Add a snapshot',
      description:
        'List what you own and what you owe to start tracking your net worth.',
      id: 'netWorth',
      isDone: progress.hasNetWorthSnapshot,
      label: 'Take a net worth snapshot',
      to: '/net-worth?new=1',
    },
  ];
}
