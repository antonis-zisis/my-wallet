import { useQuery } from '@apollo/client/react';
import { useState } from 'react';

import { GET_SUBSCRIPTIONS } from '../../graphql/subscriptions';
import {
  SUBSCRIPTION_SORT_CONFIG,
  SubscriptionsData,
  SubscriptionSortOption,
} from '../../types/subscription';
import { isActiveTrial } from '../../utils/isActiveTrial';
import { useLocalStorage } from '../useLocalStorage';
import { computeCategoryBreakdown } from './selectors/computeCategoryBreakdown';
import { computeMostExpensive } from './selectors/computeMostExpensive';
import { computeNextRenewal } from './selectors/computeNextRenewal';
import { computeRenewingThisMonthTotal } from './selectors/computeRenewingThisMonthTotal';
import { useSubscriptionsModals } from './useSubscriptionsModals';
import { useSubscriptionsMutations } from './useSubscriptionsMutations';

export const PAGE_SIZE = 10;

export function useSubscriptionsData() {
  const [activePage, setActivePage] = useState(1);
  const [activeSortOption, setActiveSortOption] =
    useLocalStorage<SubscriptionSortOption>(
      'subscriptions.activeSortOption',
      'NAME'
    );
  const [inactivePage, setInactivePage] = useState(1);
  const [showInactive, setShowInactive] = useState(false);
  const modals = useSubscriptionsModals();

  const { sortBy, sortOrder } = SUBSCRIPTION_SORT_CONFIG[activeSortOption];

  const activeVariables = {
    active: true,
    page: activePage,
    pageSize: PAGE_SIZE,
    sortBy,
    sortOrder,
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

  const mutations = useSubscriptionsMutations({
    activeVariables,
    inactiveVariables,
    modals,
    onResetActivePage: () => setActivePage(1),
  });

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
  const categoryBreakdown = computeCategoryBreakdown(activeItems);

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
    categoryBreakdown,
    activeTotalCount,
    activeTotalPages,
    inactiveError: !!inactiveError,
    inactiveItems,
    inactiveLoading,
    inactivePage,
    inactiveTotalCount,
    inactiveTotalPages,
    isCancelling: mutations.isCancelling,
    isCreateOpen: modals.isCreateOpen,
    isDeleting: mutations.isDeleting,
    isResuming: mutations.isResuming,
    mostExpensive,
    nextRenewal,
    renewingThisMonthTotal,
    activeSortOption,
    onActivePaginate: setActivePage,
    onActiveSortChange: (option: SubscriptionSortOption) => {
      setActiveSortOption(option);
      setActivePage(1);
    },
    onCancelConfirm: mutations.onCancelConfirm,
    onCloseCreate: modals.onCloseCreate,
    onCreate: mutations.onCreate,
    onDeleteConfirm: mutations.onDeleteConfirm,
    onInactivePaginate: setInactivePage,
    onOpenCreate: modals.onOpenCreate,
    onResumeActive: mutations.onResumeActive,
    onResumeFromInactive: mutations.onResumeFromInactive,
    onSelectForCancel: modals.onSelectForCancel,
    onSelectForDelete: modals.onSelectForDelete,
    onSelectForEdit: modals.onSelectForEdit,
    onSelectForResume: modals.onSelectForResume,
    onToggleInactive: () => setShowInactive((previous) => !previous),
    onUpdate: mutations.onUpdate,
    showInactive,
    subscriptionToCancel: modals.subscriptionToCancel,
    subscriptionToDelete: modals.subscriptionToDelete,
    subscriptionToEdit: modals.subscriptionToEdit,
    subscriptionToResume: modals.subscriptionToResume,
    totalMonthlyCost,
    totalYearlyCost,
  };
}
