import { Subscription } from '../../types/subscription';
import { formatDate } from '../../utils/formatDate';
import { formatMoney } from '../../utils/formatMoney';
import { getNextRenewalDate } from '../../utils/getNextRenewalDate';
import { Badge, Card, Dropdown, Skeleton } from '../ui';
import { DropdownItem } from '../ui/Dropdown';

interface SubscriptionListProps {
  subscriptions: Array<Subscription>;
  loading: boolean;
  error: boolean;
  onEdit?: (subscription: Subscription) => void;
  onCancel?: (subscription: Subscription) => void;
  onDelete: (subscription: Subscription) => void;
  onAdd?: () => void;
  emptyMessage?: string;
}

function SkeletonRow() {
  return (
    <li className="flex items-center justify-between px-1 py-3">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-44" />
      </div>
      <Skeleton className="h-4 w-20" />
    </li>
  );
}

function EmptyState({
  message,
  onAdd,
}: {
  message: string;
  onAdd?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-200 py-10 text-center dark:border-gray-700">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-10 text-gray-300 dark:text-gray-600"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
        />
      </svg>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {message}
      </p>
      {onAdd && (
        <button
          className="cursor-pointer text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
          onClick={onAdd}
        >
          Add your first subscription
        </button>
      )}
    </div>
  );
}

export function SubscriptionList({
  emptyMessage = 'No subscriptions yet.',
  error,
  loading,
  onAdd,
  onCancel,
  onDelete,
  onEdit,
  subscriptions,
}: SubscriptionListProps) {
  if (loading) {
    return (
      <Card>
        <ul
          className="divide-y divide-gray-200 dark:divide-gray-700"
          data-testid="subscription-list-skeleton"
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonRow key={index} />
          ))}
        </ul>
      </Card>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-500">Failed to load subscriptions.</p>
    );
  }

  if (subscriptions.length === 0) {
    return <EmptyState message={emptyMessage} onAdd={onAdd} />;
  }

  return (
    <Card>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {subscriptions.map((subscription) => {
          const dropdownItems: Array<DropdownItem> = [];
          if (onEdit) {
            dropdownItems.push({
              label: 'Edit',
              onClick: () => onEdit(subscription),
            });
          }

          if (onCancel) {
            dropdownItems.push({
              label: 'Cancel',
              onClick: () => onCancel(subscription),
            });
          }

          dropdownItems.push({
            label: 'Delete',
            onClick: () => onDelete(subscription),
            variant: 'danger',
          });

          return (
            <li key={subscription.id} className="flex items-center">
              <div className="flex min-w-0 flex-1 items-center justify-between px-1 py-3">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-800 dark:text-gray-100">
                      {subscription.name}
                    </span>
                    <Badge
                      variant={
                        subscription.billingCycle === 'MONTHLY'
                          ? 'success'
                          : 'info'
                      }
                    >
                      {subscription.billingCycle === 'MONTHLY'
                        ? 'Monthly'
                        : 'Yearly'}
                    </Badge>
                  </div>

                  {subscription.isActive && (
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      next renewal at{' '}
                      <span className="font-semibold">
                        {formatDate(
                          getNextRenewalDate(
                            subscription.startDate,
                            subscription.billingCycle
                          )
                        )}
                      </span>
                    </p>
                  )}
                </div>

                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {formatMoney(subscription.amount)} €
                  {subscription.billingCycle === 'YEARLY' && (
                    <span className="ml-1 font-normal text-gray-500 dark:text-gray-400">
                      ({formatMoney(subscription.monthlyCost)} €/mo)
                    </span>
                  )}
                  {subscription.billingCycle === 'MONTHLY' && (
                    <span className="ml-1 font-normal text-gray-500 dark:text-gray-400">
                      ({formatMoney(subscription.amount * 12)} €/yr)
                    </span>
                  )}
                </span>
              </div>
              <Dropdown items={dropdownItems} />
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
