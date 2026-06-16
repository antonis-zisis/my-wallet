import { useCallback, useState } from 'react';

import type { BillingCycle } from '../../types/subscription';

export interface SubscriptionFormValues {
  amount: string;
  billingCycle: BillingCycle;
  isTrial: boolean;
  name: string;
  notes: string;
  paymentMethod: string;
  startDate: string;
  trialEndsAt: string;
  url: string;
}

export const DEFAULT_SUBSCRIPTION_FORM_VALUES: SubscriptionFormValues = {
  amount: '',
  billingCycle: 'MONTHLY',
  isTrial: false,
  name: '',
  notes: '',
  paymentMethod: '',
  startDate: '',
  trialEndsAt: '',
  url: '',
};

export function useSubscriptionForm() {
  const [values, setValues] = useState<SubscriptionFormValues>(
    DEFAULT_SUBSCRIPTION_FORM_VALUES
  );

  const onChange = useCallback((updates: Partial<SubscriptionFormValues>) => {
    setValues((previous) => ({ ...previous, ...updates }));
  }, []);

  const reset = useCallback(
    () => setValues(DEFAULT_SUBSCRIPTION_FORM_VALUES),
    []
  );

  return { onChange, reset, values };
}
