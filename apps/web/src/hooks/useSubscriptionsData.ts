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
} from '../types/subscription';
import { getNextRenewalDate } from '../utils/getNextRenewalDate';

export const PAGE_SIZE = 10;

export function useSubscriptionsData() {
  const { showError, showSuccess } = useToast();
  const [activePage, setActivePage] = useState(1);
  const [inactivePage, setInactivePage] = useState(1);
  const [showInactive, setShowInactive] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [subscriptionToEdit, setSubscriptionToEdit] =
    useState<Subscription | null>(null);
  const [subscriptionToCancel, setSubscriptionToCancel] =
    useState<Subscription | null>(null);
  const [subscriptionToResume, setSubscriptionToResume] =
    useState<Subscription | null>(null);
  const [subscriptionToDelete, setSubscriptionToDelete] =
    useState<Subscription | null>(null);

  const {
    data: activeData,
    error: activeError,
    loading: activeLoading,
  } = useQuery<SubscriptionsData>(GET_SUBSCRIPTIONS, {
    variables: { active: true, page: activePage, pageSize: PAGE_SIZE },
  });

  const {
    data: inactiveData,
    error: inactiveError,
    loading: inactiveLoading,
  } = useQuery<SubscriptionsData>(GET_SUBSCRIPTIONS, {
    variables: { active: false, page: inactivePage, pageSize: PAGE_SIZE },
  });

  const [createSubscription] = useMutation(CREATE_SUBSCRIPTION, {
    refetchQueries: [
      {
        query: GET_SUBSCRIPTIONS,
        variables: { active: true, page: 1, pageSize: PAGE_SIZE },
      },
    ],
  });

  const [updateSubscription] = useMutation(UPDATE_SUBSCRIPTION, {
    refetchQueries: [
      {
        query: GET_SUBSCRIPTIONS,
        variables: { active: true, page: activePage, pageSize: PAGE_SIZE },
      },
      {
        query: GET_SUBSCRIPTIONS,
        variables: { active: false, page: inactivePage, pageSize: PAGE_SIZE },
      },
    ],
  });

  const [cancelSubscription, { loading: isCancelling }] = useMutation(
    CANCEL_SUBSCRIPTION,
    {
      refetchQueries: [
        {
          query: GET_SUBSCRIPTIONS,
          variables: { active: true, page: activePage, pageSize: PAGE_SIZE },
        },
        {
          query: GET_SUBSCRIPTIONS,
          variables: { active: false, page: inactivePage, pageSize: PAGE_SIZE },
        },
      ],
    }
  );

  const [resumeSubscription, { loading: isResuming }] = useMutation(
    RESUME_SUBSCRIPTION,
    {
      refetchQueries: [
        {
          query: GET_SUBSCRIPTIONS,
          variables: { active: true, page: activePage, pageSize: PAGE_SIZE },
        },
        {
          query: GET_SUBSCRIPTIONS,
          variables: { active: false, page: inactivePage, pageSize: PAGE_SIZE },
        },
      ],
    }
  );

  const [deleteSubscription, { loading: isDeleting }] = useMutation(
    DELETE_SUBSCRIPTION,
    {
      refetchQueries: [
        {
          query: GET_SUBSCRIPTIONS,
          variables: { active: true, page: activePage, pageSize: PAGE_SIZE },
        },
        {
          query: GET_SUBSCRIPTIONS,
          variables: { active: false, page: inactivePage, pageSize: PAGE_SIZE },
        },
      ],
    }
  );

  const activeItems = activeData?.subscriptions.items ?? [];
  const activeTotalCount = activeData?.subscriptions.totalCount ?? 0;
  const activeTotalPages = Math.ceil(activeTotalCount / PAGE_SIZE);

  const inactiveItems = inactiveData?.subscriptions.items ?? [];
  const inactiveTotalCount = inactiveData?.subscriptions.totalCount ?? 0;
  const inactiveTotalPages = Math.ceil(inactiveTotalCount / PAGE_SIZE);

  const now = new Date();
  const currentMonth = now.getMonth();

  const parseDate = (value: string): Date => {
    const coerced = /^\d+$/.test(value) ? Number(value) : value;
    return new Date(coerced);
  };

  const isActiveTrial = (subscription: { trialEndsAt: string | null }) =>
    !!subscription.trialEndsAt && parseDate(subscription.trialEndsAt) > now;

  const totalMonthlyCost = activeItems
    .filter((subscription) => !isActiveTrial(subscription))
    .reduce((sum, subscription) => sum + subscription.monthlyCost, 0);
  const totalYearlyCost = totalMonthlyCost * 12;

  const nextRenewal =
    activeItems
      .filter(
        (subscription) =>
          !subscription.cancelledAt && !isActiveTrial(subscription)
      )
      .map((subscription) => ({
        amount: subscription.amount,
        date: getNextRenewalDate(
          subscription.startDate,
          subscription.billingCycle
        ),
        name: subscription.name,
      }))
      .sort((left, right) => left.date.getTime() - right.date.getTime())[0] ??
    null;

  const renewingThisMonthTotal = activeItems
    .filter(
      (subscription) =>
        !subscription.cancelledAt && !isActiveTrial(subscription)
    )
    .reduce((total, subscription) => {
      const startDate = parseDate(subscription.startDate);
      const renewsThisMonth =
        subscription.billingCycle === 'MONTHLY' ||
        (subscription.billingCycle === 'YEARLY' &&
          startDate.getMonth() === currentMonth);
      return renewsThisMonth ? total + subscription.amount : total;
    }, 0);

  const mostExpensive = activeItems
    .filter(
      (subscription) =>
        !subscription.cancelledAt && !isActiveTrial(subscription)
    )
    .reduce<{
      monthlyCost: number;
      name: string;
    } | null>(
      (best, subscription) =>
        !best || subscription.monthlyCost > best.monthlyCost
          ? { monthlyCost: subscription.monthlyCost, name: subscription.name }
          : best,
      null
    );

  const handleCreate = async (input: {
    name: string;
    amount: number;
    billingCycle: BillingCycle;
    startDate: string;
    endDate?: string;
    trialEndsAt?: string;
  }) => {
    try {
      await createSubscription({ variables: { input } });

      setActivePage(1);
      setIsCreateOpen(false);
      showSuccess('Subscription created.');
    } catch {
      showError('Failed to create subscription.');
    }
  };

  const handleUpdate = async (input: {
    id: string;
    name: string;
    amount: number;
    billingCycle: BillingCycle;
    startDate: string;
    endDate?: string;
    trialEndsAt?: string;
  }) => {
    await updateSubscription({ variables: { input } });
    setSubscriptionToEdit(null);
  };

  const handleCancelConfirm = async () => {
    if (!subscriptionToCancel) {
      return;
    }

    await cancelSubscription({ variables: { id: subscriptionToCancel.id } });
    setSubscriptionToCancel(null);
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

  const handleResumeFromInactive = async (input: {
    id: string;
    startDate: string;
    amount: number;
    billingCycle: BillingCycle;
  }) => {
    try {
      await resumeSubscription({ variables: { input } });

      setSubscriptionToResume(null);
      showSuccess('Subscription resumed.');
    } catch {
      showError('Failed to resume subscription.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!subscriptionToDelete) {
      return;
    }

    await deleteSubscription({ variables: { id: subscriptionToDelete.id } });
    setSubscriptionToDelete(null);
  };

  return {
    activeError: !!activeError,
    activeItems,
    activeLoading,
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
    isCreateOpen,
    isDeleting,
    isResuming,
    mostExpensive,
    nextRenewal,
    renewingThisMonthTotal,
    onActivePaginate: setActivePage,
    onCancelConfirm: handleCancelConfirm,
    onCloseCreate: () => setIsCreateOpen(false),
    onCreate: handleCreate,
    onDeleteConfirm: handleDeleteConfirm,
    onInactivePaginate: setInactivePage,
    onOpenCreate: () => setIsCreateOpen(true),
    onResumeActive: handleResumeActive,
    onResumeFromInactive: handleResumeFromInactive,
    onSelectForCancel: setSubscriptionToCancel,
    onSelectForDelete: setSubscriptionToDelete,
    onSelectForEdit: setSubscriptionToEdit,
    onSelectForResume: setSubscriptionToResume,
    onToggleInactive: () => setShowInactive((previous) => !previous),
    onUpdate: handleUpdate,
    showInactive,
    subscriptionToCancel,
    subscriptionToDelete,
    subscriptionToEdit,
    subscriptionToResume,
    totalMonthlyCost,
    totalYearlyCost,
  };
}
