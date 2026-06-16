import { useMutation } from '@apollo/client/react';

import { useToast } from '../../contexts/ToastContext';
import {
  CANCEL_SUBSCRIPTION,
  CREATE_SUBSCRIPTION,
  DELETE_SUBSCRIPTION,
  GET_SUBSCRIPTIONS,
  RESUME_SUBSCRIPTION,
  UPDATE_SUBSCRIPTION,
} from '../../graphql/subscriptions';
import {
  BillingCycle,
  Subscription,
  SubscriptionSortField,
} from '../../types/subscription';
import { useSubscriptionsModals } from './useSubscriptionsModals';

type CreateInput = {
  name: string;
  amount: number;
  billingCycle: BillingCycle;
  startDate: string;
  endDate?: string;
  trialEndsAt?: string;
  notes?: string;
  paymentMethod?: string;
  url?: string;
};

type UpdateInput = CreateInput & { id: string };

type ResumeInput = {
  id: string;
  startDate: string;
  amount: number;
  billingCycle: BillingCycle;
};

type SubscriptionsQueryVariables = {
  active: boolean;
  page: number;
  pageSize: number;
  sortBy?: SubscriptionSortField;
  sortOrder?: 'ASC' | 'DESC';
};

type SubscriptionsModals = ReturnType<typeof useSubscriptionsModals>;

type UseSubscriptionsMutationsInput = {
  activeVariables: SubscriptionsQueryVariables;
  inactiveVariables: SubscriptionsQueryVariables;
  modals: SubscriptionsModals;
  onResetActivePage: () => void;
};

export function useSubscriptionsMutations({
  activeVariables,
  inactiveVariables,
  modals,
  onResetActivePage,
}: UseSubscriptionsMutationsInput) {
  const { showError, showSuccess } = useToast();

  const [createSubscription] = useMutation(CREATE_SUBSCRIPTION, {
    refetchQueries: [
      {
        query: GET_SUBSCRIPTIONS,
        variables: { ...activeVariables, page: 1 },
      },
    ],
  });

  const [updateSubscription] = useMutation(UPDATE_SUBSCRIPTION, {
    refetchQueries: [
      { query: GET_SUBSCRIPTIONS, variables: activeVariables },
      { query: GET_SUBSCRIPTIONS, variables: inactiveVariables },
    ],
  });

  const [cancelSubscription, { loading: isCancelling }] = useMutation(
    CANCEL_SUBSCRIPTION,
    {
      refetchQueries: [
        { query: GET_SUBSCRIPTIONS, variables: activeVariables },
        { query: GET_SUBSCRIPTIONS, variables: inactiveVariables },
      ],
    }
  );

  const [resumeSubscription, { loading: isResuming }] = useMutation(
    RESUME_SUBSCRIPTION,
    {
      refetchQueries: [
        { query: GET_SUBSCRIPTIONS, variables: activeVariables },
        { query: GET_SUBSCRIPTIONS, variables: inactiveVariables },
      ],
    }
  );

  const [deleteSubscription, { loading: isDeleting }] = useMutation(
    DELETE_SUBSCRIPTION,
    {
      refetchQueries: [
        { query: GET_SUBSCRIPTIONS, variables: activeVariables },
        { query: GET_SUBSCRIPTIONS, variables: inactiveVariables },
      ],
    }
  );

  const handleCreate = async (input: CreateInput) => {
    try {
      await createSubscription({ variables: { input } });

      onResetActivePage();
      modals.onCloseCreate();
      showSuccess('Subscription created.');
    } catch {
      showError('Failed to create subscription.');
    }
  };

  const handleUpdate = async (input: UpdateInput) => {
    await updateSubscription({ variables: { input } });
    modals.onSelectForEdit(null);
  };

  const handleCancelConfirm = async () => {
    if (!modals.subscriptionToCancel) {
      return;
    }

    await cancelSubscription({
      variables: { id: modals.subscriptionToCancel.id },
    });
    modals.onSelectForCancel(null);
  };

  const handleResumeActive = async (subscription: Subscription) => {
    try {
      await resumeSubscription({
        variables: { input: { id: subscription.id } },
      });
      showSuccess('Subscription resumed.');
    } catch {
      showError('Failed to resume subscription.');
    }
  };

  const handleResumeFromInactive = async (input: ResumeInput) => {
    try {
      await resumeSubscription({ variables: { input } });

      modals.onSelectForResume(null);
      showSuccess('Subscription resumed.');
    } catch {
      showError('Failed to resume subscription.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!modals.subscriptionToDelete) {
      return;
    }

    await deleteSubscription({
      variables: { id: modals.subscriptionToDelete.id },
    });
    modals.onSelectForDelete(null);
  };

  return {
    isCancelling,
    isDeleting,
    isResuming,
    onCancelConfirm: handleCancelConfirm,
    onCreate: handleCreate,
    onDeleteConfirm: handleDeleteConfirm,
    onResumeActive: handleResumeActive,
    onResumeFromInactive: handleResumeFromInactive,
    onUpdate: handleUpdate,
  };
}
