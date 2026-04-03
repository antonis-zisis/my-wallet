import { Subscription } from '../../types/subscription';
import { formatMoney } from '../../utils/formatMoney';
import { Card } from '../ui';

export function SubscriptionSummarySection({
  subscriptions,
  currentIncome,
}: {
  subscriptions: Array<Subscription>;
  currentIncome: number;
}) {
  const totalMonthlyCost = subscriptions.reduce(
    (sum, sub) => sum + sub.monthlyCost,
    0
  );

  const percentOfIncome =
    currentIncome > 0
      ? `${((totalMonthlyCost / currentIncome) * 100).toFixed(1)}%`
      : '-';

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Active Subscriptions
        </p>
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {subscriptions.length}
        </p>
      </Card>

      <Card>
        <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Cost</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {formatMoney(totalMonthlyCost)} €
        </p>
      </Card>

      <Card>
        <p className="text-sm text-gray-500 dark:text-gray-400">% of Income</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {percentOfIncome}
        </p>
      </Card>
    </div>
  );
}
