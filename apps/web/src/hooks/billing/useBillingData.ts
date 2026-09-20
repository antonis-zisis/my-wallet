import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';

import { useToast } from '../../contexts/ToastContext';
import {
  CREATE_CHECKOUT_SESSION,
  GET_PLAN_PRICES,
} from '../../graphql/billing';
import { type BillingInterval, type PlanPrice } from '../../types/billing';
import { redirectTo } from '../../utils/redirectTo';
import {
  buildIntervalOptions,
  type IntervalOption,
} from './selectors/buildIntervalOptions';

type PlanPricesData = {
  planPrices: Array<PlanPrice>;
};

type CheckoutSessionData = {
  createCheckoutSession: { url: string };
};

type UseBillingDataResult = {
  intervalOptions: Array<IntervalOption>;
  isCheckoutAvailable: boolean;
  isStartingCheckout: boolean;
  onUpgrade: (interval: BillingInterval) => Promise<void>;
};

export function useBillingData(): UseBillingDataResult {
  const { showError } = useToast();
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);

  const { data } = useQuery<PlanPricesData>(GET_PLAN_PRICES);
  const [createCheckoutSession] = useMutation<CheckoutSessionData>(
    CREATE_CHECKOUT_SESSION
  );

  const intervalOptions = buildIntervalOptions(data?.planPrices ?? []);

  const onUpgrade = async (interval: BillingInterval) => {
    setIsStartingCheckout(true);

    try {
      const { data: session } = await createCheckoutSession({
        variables: { input: { interval } },
      });

      if (!session?.createCheckoutSession.url) {
        throw new Error('Checkout session has no URL');
      }

      redirectTo(session.createCheckoutSession.url);
    } catch {
      showError('Could not start checkout. Please try again.');
      setIsStartingCheckout(false);
    }
  };

  return {
    intervalOptions,
    isCheckoutAvailable: intervalOptions.length > 0,
    isStartingCheckout,
    onUpgrade,
  };
}
