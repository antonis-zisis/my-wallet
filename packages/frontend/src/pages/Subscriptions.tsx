import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';

import {
  CancelSubscriptionModal,
  CreateSubscriptionModal,
  DeleteSubscriptionModal,
  EditSubscriptionModal,
  SubscriptionList,
} from '../components/subscriptions';
import { Button, Pagination } from '../components/ui';
import {
  CANCEL_SUBSCRIPTION,
  CREATE_SUBSCRIPTION,
  DELETE_SUBSCRIPTION,
  GET_SUBSCRIPTIONS,
  UPDATE_SUBSCRIPTION,
} from '../graphql/subscriptions';
import {
  BillingCycle,
  Subscription,
  SubscriptionsData,
} from '../types/subscription';
import { formatMoney } from '../utils/formatMoney';

const PAGE_SIZE = 20;

export function Subscriptions() {
  const [activePage, setActivePage] = useState(1);
  const [inactivePage, setInactivePage] = useState(1);
  const [showInactive, setShowInactive] = useState(false);

  const {
    data: activeData,
    loading: activeLoading,
    error: activeError,
  } = useQuery<SubscriptionsData>(GET_SUBSCRIPTIONS, {
    variables: { page: activePage, active: true },
  });

  const {
    data: inactiveData,
    loading: inactiveLoading,
    error: inactiveError,
  } = useQuery<SubscriptionsData>(GET_SUBSCRIPTIONS, {
    variables: { page: inactivePage, active: false },
  });

  const [createSubscription] = useMutation(CREATE_SUBSCRIPTION, {
    refetchQueries: [
      { query: GET_SUBSCRIPTIONS, variables: { page: 1, active: true } },
    ],
  });

  const [updateSubscription] = useMutation(UPDATE_SUBSCRIPTION, {
    refetchQueries: [
      {
        query: GET_SUBSCRIPTIONS,
        variables: { page: activePage, active: true },
      },
      {
        query: GET_SUBSCRIPTIONS,
        variables: { page: inactivePage, active: false },
      },
    ],
  });

  const [cancelSubscription, { loading: isCancelling }] = useMutation(
    CANCEL_SUBSCRIPTION,
    {
      refetchQueries: [
        {
          query: GET_SUBSCRIPTIONS,
          variables: { page: activePage, active: true },
        },
        {
          query: GET_SUBSCRIPTIONS,
          variables: { page: inactivePage, active: false },
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
          variables: { page: activePage, active: true },
        },
        {
          query: GET_SUBSCRIPTIONS,
          variables: { page: inactivePage, active: false },
        },
      ],
    }
  );

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [subscriptionToEdit, setSubscriptionToEdit] =
    useState<Subscription | null>(null);
  const [subscriptionToCancel, setSubscriptionToCancel] =
    useState<Subscription | null>(null);
  const [subscriptionToDelete, setSubscriptionToDelete] =
    useState<Subscription | null>(null);

  const activeItems = activeData?.subscriptions.items ?? [];
  const activeTotalCount = activeData?.subscriptions.totalCount ?? 0;
  const activeTotalPages = Math.ceil(activeTotalCount / PAGE_SIZE);

  const inactiveItems = inactiveData?.subscriptions.items ?? [];
  const inactiveTotalCount = inactiveData?.subscriptions.totalCount ?? 0;
  const inactiveTotalPages = Math.ceil(inactiveTotalCount / PAGE_SIZE);

  const totalMonthlyCost = activeItems.reduce(
    (sum, sub) => sum + sub.monthlyCost,
    0
  );

  const handleCreate = async (input: {
    name: string;
    amount: number;
    billingCycle: BillingCycle;
    startDate: string;
    endDate?: string;
  }) => {
    await createSubscription({ variables: { input } });
    setActivePage(1);
    setIsCreateOpen(false);
  };

  const handleUpdate = async (input: {
    id: string;
    name: string;
    amount: number;
    billingCycle: BillingCycle;
    startDate: string;
    endDate?: string;
  }) => {
    await updateSubscription({ variables: { input } });
    setSubscriptionToEdit(null);
  };

  const handleCancelConfirm = async () => {
    if (!subscriptionToCancel) {
      return;
    }
    await cancelSubscription({
      variables: { id: subscriptionToCancel.id },
    });
    setSubscriptionToCancel(null);
  };

  const handleDeleteConfirm = async () => {
    if (!subscriptionToDelete) {
      return;
    }
    await deleteSubscription({
      variables: { id: subscriptionToDelete.id },
    });
    setSubscriptionToDelete(null);
  };

  return (
    <div className="py-8">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {!activeLoading && !activeError && activeTotalCount > 0 && (
              <span>
                Total monthly cost:{' '}
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {formatMoney(totalMonthlyCost)} €
                </span>
              </span>
            )}
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            New Subscription
          </Button>
        </div>

        <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
          <SubscriptionList
            subscriptions={activeItems}
            loading={activeLoading}
            error={!!activeError}
            onEdit={setSubscriptionToEdit}
            onCancel={setSubscriptionToCancel}
            onDelete={setSubscriptionToDelete}
            emptyMessage="No active subscriptions. Add your first one!"
          />
        </div>

        {!activeLoading && !activeError && activeTotalCount > 0 && (
          <Pagination
            page={activePage}
            totalPages={activeTotalPages}
            totalCount={activeTotalCount}
            pageSize={PAGE_SIZE}
            itemCount={activeItems.length}
            onPageChange={setActivePage}
          />
        )}

        {(inactiveTotalCount > 0 || inactiveLoading) && (
          <div className="mt-8">
            <button
              className="mb-4 flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => setShowInactive(!showInactive)}
            >
              <span
                className={`transition-transform ${showInactive ? 'rotate-90' : ''}`}
              >
                ▶
              </span>
              Inactive Subscriptions ({inactiveTotalCount})
            </button>

            {showInactive && (
              <>
                <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
                  <SubscriptionList
                    subscriptions={inactiveItems}
                    loading={inactiveLoading}
                    error={!!inactiveError}
                    onDelete={setSubscriptionToDelete}
                    emptyMessage="No inactive subscriptions."
                  />
                </div>

                {!inactiveLoading &&
                  !inactiveError &&
                  inactiveTotalCount > 0 && (
                    <Pagination
                      page={inactivePage}
                      totalPages={inactiveTotalPages}
                      totalCount={inactiveTotalCount}
                      pageSize={PAGE_SIZE}
                      itemCount={inactiveItems.length}
                      onPageChange={setInactivePage}
                    />
                  )}
              </>
            )}
          </div>
        )}
      </div>

      <CreateSubscriptionModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />

      <EditSubscriptionModal
        isOpen={!!subscriptionToEdit}
        onClose={() => setSubscriptionToEdit(null)}
        onSubmit={handleUpdate}
        subscription={subscriptionToEdit}
      />

      <CancelSubscriptionModal
        isOpen={!!subscriptionToCancel}
        onClose={() => setSubscriptionToCancel(null)}
        onConfirm={handleCancelConfirm}
        subscriptionName={subscriptionToCancel?.name ?? ''}
        isCancelling={isCancelling}
      />

      <DeleteSubscriptionModal
        isOpen={!!subscriptionToDelete}
        onClose={() => setSubscriptionToDelete(null)}
        onConfirm={handleDeleteConfirm}
        subscriptionName={subscriptionToDelete?.name ?? ''}
        isDeleting={isDeleting}
      />
    </div>
  );
}
