import { Subscription } from '../../types/subscription';
import { formatDate } from '../../utils/formatDate';
import { formatMoney } from '../../utils/formatMoney';
import { getDaysUntil } from '../../utils/getDaysUntil';
import { getNextRenewalDate } from '../../utils/getNextRenewalDate';
import { CreditCardIcon } from '../icons';
import { Badge, Card, Dropdown, Skeleton } from '../ui';
import { DropdownItem } from '../ui/Dropdown';
interface SubscriptionListProps {
  subscriptions: Array<Subscription>;
  loading: boolean;
  error: boolean;
  onEdit?: (subscription: Subscription) => void;
  onCancel?: (subscription: Subscription) => void;
  onResume?: (subscription: Subscription) => void;
  onDelete: (subscription: Subscription) => void;
  onAdd?: () => void;
  emptyMessage?: string;
}

function SkeletonRow() {
  return (
    <li className="flex items-center gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-3 px-1 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-14 rounded" />
          </div>
          <Skeleton className="mt-1.5 h-3 w-44" />
        </div>
        <div className="space-y-1.5 text-right">
          <Skeleton className="ml-auto h-4 w-20" />
          <Skeleton className="ml-auto h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-7 w-7 shrink-0 rounded" />
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
    <div className="flex flex-col items-center justify-center gap-3 rounded border-2 border-dashed border-gray-200 py-10 text-center dark:border-gray-700">
      <CreditCardIcon className="size-10 text-gray-300 dark:text-gray-600" />

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

function formatCancellationCountdown(endDate: string): string {
  const daysLeft = getDaysUntil(endDate);

  if (daysLeft < 0) {
    return `ended ${formatDate(endDate)}`;
  }

  if (daysLeft === 0) {
    return 'ends today';
  }

  if (daysLeft === 1) {
    return 'ends tomorrow';
  }

  return `ends in ${daysLeft} days · ${formatDate(endDate)}`;
}

function formatTrialCountdown(trialEndsAt: string): string {
  const daysLeft = getDaysUntil(trialEndsAt);

  if (daysLeft < 0) {
    return `trial ended ${formatDate(trialEndsAt)}`;
  }

  if (daysLeft === 0) {
    return 'trial ends today';
  }

  if (daysLeft === 1) {
    return 'trial ends tomorrow';
  }

  return `trial ends in ${daysLeft} days · ${formatDate(trialEndsAt)}`;
}

function TertiaryLine({ subscription }: { subscription: Subscription }) {
  const parts: Array<string> = [];

  if (subscription.paymentMethod) {
    parts.push(`via ${subscription.paymentMethod}`);
  }

  if (subscription.notes) {
    parts.push(subscription.notes);
  }

  if (parts.length === 0) {
    return null;
  }

  return (
    <p className="mt-0.5 truncate text-xs text-gray-400 italic dark:text-gray-500">
      {parts.join(' · ')}
    </p>
  );
}

function SecondaryLine({ subscription }: { subscription: Subscription }) {
  if (subscription.cancelledAt && subscription.endDate) {
    return (
      <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400">
        {formatCancellationCountdown(subscription.endDate)}
      </p>
    );
  }

  if (subscription.trialEndsAt) {
    const daysLeft = getDaysUntil(subscription.trialEndsAt);

    if (daysLeft >= 0) {
      return (
        <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400">
          {formatTrialCountdown(subscription.trialEndsAt)}
        </p>
      );
    }
  }

  if (!subscription.isActive) {
    return null;
  }

  const renewalDate = getNextRenewalDate(
    subscription.startDate,
    subscription.billingCycle
  );
  const daysUntil = getDaysUntil(renewalDate);
  const relativeLabel =
    daysUntil === 0
      ? 'today'
      : daysUntil === 1
        ? 'tomorrow'
        : daysUntil < 30
          ? `in ${daysUntil}d`
          : null;

  return (
    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
      next renewal at{' '}
      <span className="font-semibold">{formatDate(renewalDate)}</span>
      {relativeLabel && ` · ${relativeLabel}`}
    </p>
  );
}

function AmountCell({ subscription }: { subscription: Subscription }) {
  const normalized =
    subscription.billingCycle === 'MONTHLY'
      ? `${formatMoney(subscription.amount * 12)} € / yr`
      : `${formatMoney(subscription.monthlyCost)} € / mo`;

  return (
    <div className="text-right">
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
        {formatMoney(subscription.amount)} €
      </p>
      <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
        {normalized}
      </p>
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
  onResume,
  subscriptions,
}: SubscriptionListProps) {
  if (loading) {
    return (
      <Card>
        <ul
          className="divide-y divide-gray-200 dark:divide-gray-700"
          data-testid="subscription-list-skeleton"
        >
          {Array.from({ length: 10 }).map((_, index) => (
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

          if (onCancel && !subscription.cancelledAt) {
            dropdownItems.push({
              label: 'Cancel',
              onClick: () => onCancel(subscription),
            });
          }

          if (
            onResume &&
            (subscription.cancelledAt || !subscription.isActive)
          ) {
            dropdownItems.push({
              label: 'Resume',
              onClick: () => onResume(subscription),
            });
          }

          dropdownItems.push({
            label: 'Delete',
            onClick: () => onDelete(subscription),
            variant: 'danger',
          });

          return (
            <li key={subscription.id} className="flex items-center gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-3 px-1 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {subscription.url ? (
                      <a
                        className="truncate font-medium text-gray-800 hover:underline dark:text-gray-100"
                        href={subscription.url}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {subscription.name}
                      </a>
                    ) : (
                      <span className="truncate font-medium text-gray-800 dark:text-gray-100">
                        {subscription.name}
                      </span>
                    )}

                    <Badge variant="default" size="sm">
                      {subscription.billingCycle === 'MONTHLY'
                        ? 'Monthly'
                        : 'Yearly'}
                    </Badge>

                    {subscription.trialEndsAt &&
                      getDaysUntil(subscription.trialEndsAt) >= 0 && (
                        <Badge variant="warning" size="sm">
                          Trial
                        </Badge>
                      )}

                    {subscription.cancelledAt && (
                      <Badge variant="danger" size="sm">
                        Cancelled
                      </Badge>
                    )}
                  </div>

                  <SecondaryLine subscription={subscription} />
                  <TertiaryLine subscription={subscription} />
                </div>

                <AmountCell subscription={subscription} />
              </div>

              <Dropdown items={dropdownItems} />
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
