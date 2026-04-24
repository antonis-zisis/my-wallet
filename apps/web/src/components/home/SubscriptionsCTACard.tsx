import { Link } from 'react-router-dom';

import { Card } from '../ui';

export function SubscriptionsCTACard() {
  return (
    <Card>
      <div className="flex flex-col items-center justify-center gap-3 rounded border-2 border-dashed border-gray-200 py-10 text-center dark:border-gray-700">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          No subscriptions tracked yet
        </p>

        <p className="text-xs text-gray-400 dark:text-gray-500">
          Add your recurring bills to track monthly costs and upcoming renewals.
        </p>

        <Link
          to="/subscriptions"
          className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
        >
          Add a subscription
        </Link>
      </div>
    </Card>
  );
}
