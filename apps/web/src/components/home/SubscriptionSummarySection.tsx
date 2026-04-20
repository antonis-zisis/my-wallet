import { Subscription } from '../../types/subscription';
import { formatMoney } from '../../utils/formatMoney';
import { InfoIcon } from '../icons';
import { Card, Tooltip } from '../ui';

interface SubscriptionSummarySectionProps {
  subscriptions: Array<Subscription>;
  currentIncome: number;
}

export function SubscriptionSummarySection({
  currentIncome,
  subscriptions,
}: SubscriptionSummarySectionProps) {
  const totalMonthlyCost = subscriptions.reduce(
    (sum, subscription) => sum + subscription.monthlyCost,
    0
  );

  const totalYearlyCost = totalMonthlyCost * 12;

  const percentOfIncome =
    currentIncome > 0
      ? `${((totalMonthlyCost / currentIncome) * 100).toFixed(1)}%`
      : '-';

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
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
        <p className="text-sm text-gray-500 dark:text-gray-400">Yearly Cost</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {formatMoney(totalYearlyCost)} €
        </p>
      </Card>

      <Card>
        <p className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
          % of Income
          <Tooltip content="Based on the income of your latest report.">
            <InfoIcon className="h-3.5 w-3.5 cursor-pointer text-gray-400 dark:text-gray-500" />
          </Tooltip>
        </p>

        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {percentOfIncome}
        </p>
      </Card>
    </div>
  );
}
