import { Subscription } from '../../types/subscription';
import { formatDate } from '../../utils/formatDate';
import { formatMoney } from '../../utils/formatMoney';
import { Badge, Dropdown } from '../ui';
import { DropdownItem } from '../ui/Dropdown';

interface SubscriptionListProps {
  subscriptions: Array<Subscription>;
  loading: boolean;
  error: boolean;
  onEdit?: (subscription: Subscription) => void;
  onCancel?: (subscription: Subscription) => void;
  onDelete: (subscription: Subscription) => void;
  emptyMessage?: string;
}

export function SubscriptionList({
  subscriptions,
  loading,
  error,
  onEdit,
  onCancel,
  onDelete,
  emptyMessage = 'No subscriptions yet.',
}: SubscriptionListProps) {
  if (loading) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400">
        Loading subscriptions...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-500">Failed to load subscriptions.</p>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400">
        {emptyMessage}
      </p>
    );
  }

  return (
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
              <div className="flex items-center gap-3">
                <span className="font-medium text-gray-800 dark:text-gray-100">
                  {subscription.name}
                </span>
                <Badge
                  variant={
                    subscription.billingCycle === 'MONTHLY' ? 'success' : 'info'
                  }
                >
                  {subscription.billingCycle === 'MONTHLY'
                    ? 'Monthly'
                    : 'Yearly'}
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {formatMoney(subscription.amount)} €
                  {subscription.billingCycle === 'YEARLY' && (
                    <span className="ml-1 font-normal text-gray-500 dark:text-gray-400">
                      ({formatMoney(subscription.monthlyCost)} €/mo)
                    </span>
                  )}
                </span>
                {subscription.endDate && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    until {formatDate(subscription.endDate)}
                  </span>
                )}
              </div>
            </div>
            <Dropdown items={dropdownItems} />
          </li>
        );
      })}
    </ul>
  );
}
