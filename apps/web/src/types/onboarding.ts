export type OnboardingProgress = {
  hasContract: boolean;
  hasFullName: boolean;
  hasNetWorthSnapshot: boolean;
  hasSubscription: boolean;
  hasTransaction: boolean;
};

export type OnboardingStep = {
  actionLabel: string;
  description: string;
  id: string;
  isDone: boolean;
  label: string;
  to: string;
};

export type OnboardingData = {
  me: {
    id: string;
    onboardingCompletedAt: string | null;
    onboardingProgress: OnboardingProgress;
  };
};
