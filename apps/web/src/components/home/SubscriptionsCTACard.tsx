import { Link } from 'react-router-dom';

import { Card } from '../ui';

export function SubscriptionsCTACard() {
  return (
    <Card>
      <div className="flex flex-col items-center justify-center gap-3 rounded border-2 border-dashed border-gray-200 py-10 text-center dark:border-gray-700">
        <p className="text-text-secondary text-sm font-medium">
          No subscriptions tracked yet
        </p>

        <p className="text-text-tertiary text-xs">
          Add your recurring bills to track monthly costs and upcoming renewals.
        </p>

        <Link
          to="/subscriptions"
          className="text-brand-600 dark:text-brand-400 text-sm font-semibold hover:underline"
        >
          Add a subscription
        </Link>
      </div>
    </Card>
  );
}
