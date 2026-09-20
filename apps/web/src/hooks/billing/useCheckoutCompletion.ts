import { useEffect, useState } from 'react';

import { useUser } from '../../contexts/UserContext';

const RETRY_DELAYS_MS = [1000, 1500, 2500, 4000, 6000];

type UseCheckoutCompletionInput = {
  isReturningFromCheckout: boolean;
};

type UseCheckoutCompletionResult = {
  hasTimedOut: boolean;
  isFinalizing: boolean;
};

export function useCheckoutCompletion({
  isReturningFromCheckout,
}: UseCheckoutCompletionInput): UseCheckoutCompletionResult {
  const { refetchUser, user } = useUser();
  const [attempts, setAttempts] = useState(0);

  const isUpgraded = user?.plan === 'PRO';
  const isWaiting = isReturningFromCheckout && !isUpgraded;
  const hasAttemptsLeft = attempts < RETRY_DELAYS_MS.length;

  useEffect(() => {
    if (!isWaiting || !hasAttemptsLeft) {
      return;
    }

    const timer = setTimeout(() => {
      refetchUser();
      setAttempts((previous) => previous + 1);
    }, RETRY_DELAYS_MS[attempts]);

    return () => clearTimeout(timer);
  }, [attempts, hasAttemptsLeft, isWaiting, refetchUser]);

  return {
    hasTimedOut: isWaiting && !hasAttemptsLeft,
    isFinalizing: isWaiting && hasAttemptsLeft,
  };
}
