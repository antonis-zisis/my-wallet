import { Subscription } from '../../types/subscription';
import { CreditCardIcon } from '../icons';
import { Card } from '../ui';
import { SubscriptionListRow } from './SubscriptionListRow';
import { SubscriptionListSkeleton } from './SubscriptionListSkeleton';

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

function EmptyState({
  message,
  onAdd,
}: {
  message: string;
  onAdd?: () => void;
}) {
  return (
    <div className="border-border flex flex-col items-center justify-center gap-3 rounded border-2 border-dashed py-10 text-center">
      <CreditCardIcon className="text-border-strong size-10" />

      <p className="text-text-secondary text-sm font-medium">{message}</p>

      {onAdd && (
        <button
          className="text-brand-600 dark:text-brand-400 cursor-pointer text-sm font-semibold hover:underline"
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
  onResume,
  subscriptions,
}: SubscriptionListProps) {
  if (loading) {
    return <SubscriptionListSkeleton />;
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
      <ul className="divide-border divide-y">
        {subscriptions.map((subscription) => (
          <SubscriptionListRow
            key={subscription.id}
            subscription={subscription}
            onCancel={onCancel}
            onDelete={onDelete}
            onEdit={onEdit}
            onResume={onResume}
          />
        ))}
      </ul>
    </Card>
  );
}
