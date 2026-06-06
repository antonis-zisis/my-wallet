import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';

import { useToast } from '../contexts/ToastContext';
import {
  CANCEL_SUBSCRIPTION,
  CREATE_SUBSCRIPTION,
  DELETE_SUBSCRIPTION,
  GET_SUBSCRIPTIONS,
  RESUME_SUBSCRIPTION,
  UPDATE_SUBSCRIPTION,
} from '../graphql/subscriptions';
import {
  BillingCycle,
  Subscription,
  SubscriptionsData,
  SubscriptionSortField,
} from '../types/subscription';
import { isActiveTrial } from '../utils/isActiveTrial';
import { computeMostExpensive } from './subscriptions/selectors/computeMostExpensive';
import { computeNextRenewal } from './subscriptions/selectors/computeNextRenewal';
import { computeRenewingThisMonthTotal } from './subscriptions/selectors/computeRenewingThisMonthTotal';
import { useSubscriptionsModals } from './subscriptions/useSubscriptionsModals';
import { useLocalStorage } from './useLocalStorage';

export const PAGE_SIZE = 10;

const SORT_ORDER_BY_FIELD: Record<SubscriptionSortField, 'ASC' | 'DESC'> = {
  MONTHLY_COST: 'DESC',
  NAME: 'ASC',
  NEXT_RENEWAL: 'ASC',
};

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

export function useSubscriptionsData() {
  const { showError, showSuccess } = useToast();
  const [activePage, setActivePage] = useState(1);
  const [activeSortBy, setActiveSortBy] =
    useLocalStorage<SubscriptionSortField>(
      'subscriptions.activeSortBy',
      'NAME'
    );
  const [inactivePage, setInactivePage] = useState(1);
  const [showInactive, setShowInactive] = useState(false);
  const modals = useSubscriptionsModals();

  const activeSortOrder = SORT_ORDER_BY_FIELD[activeSortBy];

  const activeVariables = {
    active: true,
    page: activePage,
    pageSize: PAGE_SIZE,
    sortBy: activeSortBy,
    sortOrder: activeSortOrder,
  };

  const inactiveVariables = {
    active: false,
    page: inactivePage,
    pageSize: PAGE_SIZE,
  };

  const {
    data: activeData,
    error: activeError,
    loading: activeFetching,
    previousData: activePreviousData,
  } = useQuery<SubscriptionsData>(GET_SUBSCRIPTIONS, {
    variables: activeVariables,
  });

  const resolvedActiveData = activeData ?? activePreviousData;
  const activeLoading = activeFetching && !resolvedActiveData;

  const {
    data: inactiveData,
    error: inactiveError,
    loading: inactiveLoading,
  } = useQuery<SubscriptionsData>(GET_SUBSCRIPTIONS, {
    variables: inactiveVariables,
  });

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

  const activeItems = resolvedActiveData?.subscriptions.items ?? [];
  const activeTotalCount = resolvedActiveData?.subscriptions.totalCount ?? 0;
  const activeTotalPages = Math.ceil(activeTotalCount / PAGE_SIZE);

  const inactiveItems = inactiveData?.subscriptions.items ?? [];
  const inactiveTotalCount = inactiveData?.subscriptions.totalCount ?? 0;
  const inactiveTotalPages = Math.ceil(inactiveTotalCount / PAGE_SIZE);

  const totalMonthlyCost = activeItems
    .filter((subscription) => !isActiveTrial(subscription))
    .reduce((sum, subscription) => sum + subscription.monthlyCost, 0);
  const totalYearlyCost = totalMonthlyCost * 12;
  const nextRenewal = computeNextRenewal(activeItems);
  const renewingThisMonthTotal = computeRenewingThisMonthTotal(activeItems);
  const mostExpensive = computeMostExpensive(activeItems);

  const handleCreate = async (input: CreateInput) => {
    try {
      await createSubscription({ variables: { input } });

      setActivePage(1);
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

  const allLoadedNames = [
    ...activeItems.map((subscription) => subscription.name),
    ...inactiveItems.map((subscription) => subscription.name),
  ];

  return {
    activeError: !!activeError,
    activeItems,
    activeLoading,
    allLoadedNames,
    activePage,
    activeTotalCount,
    activeTotalPages,
    inactiveError: !!inactiveError,
    inactiveItems,
    inactiveLoading,
    inactivePage,
    inactiveTotalCount,
    inactiveTotalPages,
    isCancelling,
    isCreateOpen: modals.isCreateOpen,
    isDeleting,
    isResuming,
    mostExpensive,
    nextRenewal,
    renewingThisMonthTotal,
    activeSortBy,
    onActivePaginate: setActivePage,
    onActiveSortChange: (sortField: SubscriptionSortField) => {
      setActiveSortBy(sortField);
      setActivePage(1);
    },
    onCancelConfirm: handleCancelConfirm,
    onCloseCreate: modals.onCloseCreate,
    onCreate: handleCreate,
    onDeleteConfirm: handleDeleteConfirm,
    onInactivePaginate: setInactivePage,
    onOpenCreate: modals.onOpenCreate,
    onResumeActive: handleResumeActive,
    onResumeFromInactive: handleResumeFromInactive,
    onSelectForCancel: modals.onSelectForCancel,
    onSelectForDelete: modals.onSelectForDelete,
    onSelectForEdit: modals.onSelectForEdit,
    onSelectForResume: modals.onSelectForResume,
    onToggleInactive: () => setShowInactive((previous) => !previous),
    onUpdate: handleUpdate,
    showInactive,
    subscriptionToCancel: modals.subscriptionToCancel,
    subscriptionToDelete: modals.subscriptionToDelete,
    subscriptionToEdit: modals.subscriptionToEdit,
    subscriptionToResume: modals.subscriptionToResume,
    totalMonthlyCost,
    totalYearlyCost,
  };
}
