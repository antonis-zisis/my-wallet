import { useMutation } from '@apollo/client/react';
import { useState } from 'react';

import { useToast } from '../../contexts/ToastContext';
import { CREATE_BILLING_PORTAL_SESSION } from '../../graphql/billing';
import { redirectTo } from '../../utils/redirectTo';

type BillingPortalData = {
  createBillingPortalSession: { url: string };
};

type UseBillingPortalResult = {
  isOpeningPortal: boolean;
  onManageBilling: () => Promise<void>;
};

export function useBillingPortal(): UseBillingPortalResult {
  const { showError } = useToast();
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [createBillingPortalSession] = useMutation<BillingPortalData>(
    CREATE_BILLING_PORTAL_SESSION
  );

  const onManageBilling = async () => {
    setIsOpeningPortal(true);

    try {
      const { data } = await createBillingPortalSession();

      if (!data?.createBillingPortalSession.url) {
        throw new Error('Billing portal session has no URL');
      }

      redirectTo(data.createBillingPortalSession.url);
    } catch {
      showError('Could not open the billing portal. Please try again.');
      setIsOpeningPortal(false);
    }
  };

  return { isOpeningPortal, onManageBilling };
}
