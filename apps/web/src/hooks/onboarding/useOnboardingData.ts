import { useMutation, useQuery } from '@apollo/client/react';
import { useEffect, useState } from 'react';

import { useCurrency } from '../../contexts/CurrencyContext';
import { useToast } from '../../contexts/ToastContext';
import { useUser } from '../../contexts/UserContext';
import { COMPLETE_ONBOARDING, GET_ONBOARDING } from '../../graphql/user';
import { type Currency } from '../../types/currency';
import { OnboardingData } from '../../types/onboarding';
import { useLocalStorage } from '../useLocalStorage';
import { buildOnboardingSteps } from './selectors/buildOnboardingSteps';

type WelcomeValues = {
  currency: Currency;
  fullName: string;
};

export function useOnboardingData() {
  const { updateUser, user } = useUser();
  const { currency } = useCurrency();
  const { showError } = useToast();

  const { data, loading } = useQuery<OnboardingData>(GET_ONBOARDING, {
    fetchPolicy: 'cache-and-network',
  });
  const [completeOnboarding] = useMutation(COMPLETE_ONBOARDING);

  const [isWelcomeSeen, setIsWelcomeSeen] = useLocalStorage(
    'onboarding.welcomeSeen',
    false
  );
  const [isSavingWelcome, setIsSavingWelcome] = useState(false);

  const progress = data?.me.onboardingProgress ?? null;
  const steps = progress ? buildOnboardingSteps(progress) : [];
  const completedCount = steps.filter((step) => step.isDone).length;
  const isComplete = !!data?.me.onboardingCompletedAt;
  const isEveryStepDone = steps.length > 0 && completedCount === steps.length;

  useEffect(() => {
    if (!loading && !isComplete && isEveryStepDone) {
      completeOnboarding().catch(() => undefined);
    }
  }, [completeOnboarding, isComplete, isEveryStepDone, loading]);

  const handleDismiss = async () => {
    try {
      await completeOnboarding();
    } catch {
      showError('Failed to hide the checklist.');
    }
  };

  const handleSaveWelcome = async (values: WelcomeValues) => {
    setIsSavingWelcome(true);

    try {
      await updateUser({
        currency: values.currency,
        fullName: values.fullName.trim(),
      });
    } catch {
      showError('Failed to save your details.');
    } finally {
      setIsSavingWelcome(false);
      setIsWelcomeSeen(true);
    }
  };

  return {
    completedCount,
    initialCurrency: currency,
    initialFullName: user?.fullName ?? '',
    isChecklistVisible: !!progress && !isComplete,
    isSavingWelcome,
    isWelcomeOpen:
      !!progress && !isComplete && !isWelcomeSeen && completedCount === 0,
    onCloseWelcome: () => setIsWelcomeSeen(true),
    onDismiss: handleDismiss,
    onSaveWelcome: handleSaveWelcome,
    steps,
    totalCount: steps.length,
  };
}
