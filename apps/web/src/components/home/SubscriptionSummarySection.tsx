import { Subscription } from '../../types/subscription';
import { formatMoney } from '../../utils/formatMoney';
import { InfoIcon } from '../icons';
import { Card, Tooltip } from '../ui';

interface SubscriptionSummarySectionProps {
  subscriptions: Array<Subscription>;
  currentIncome: number;
}

function isActiveTrial(subscription: Subscription): boolean {
  if (!subscription.trialEndsAt) {
    return false;
  }
  const value = /^\d+$/.test(subscription.trialEndsAt)
    ? Number(subscription.trialEndsAt)
    : subscription.trialEndsAt;
  return new Date(value) > new Date();
}

export function SubscriptionSummarySection({
  currentIncome,
  subscriptions,
}: SubscriptionSummarySectionProps) {
  const paidSubscriptions = subscriptions.filter(
    (subscription) => !isActiveTrial(subscription)
  );

  const totalMonthlyCost = paidSubscriptions.reduce(
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
        <p className="text-text-secondary text-sm">Active Subscriptions</p>

        <p className="text-text-primary text-2xl font-bold">
          {subscriptions.length}
        </p>
      </Card>

      <Card>
        <p className="text-text-secondary text-sm">Monthly Cost</p>
        <p className="text-text-primary text-2xl font-bold">
          {formatMoney(totalMonthlyCost)} €
        </p>
      </Card>

      <Card>
        <p className="text-text-secondary text-sm">Yearly Cost</p>
        <p className="text-text-primary text-2xl font-bold">
          {formatMoney(totalYearlyCost)} €
        </p>
      </Card>

      <Card>
        <p className="text-text-secondary flex items-center gap-1 text-sm">
          % of Income
          <Tooltip content="Based on the income of your latest report.">
            <InfoIcon className="text-text-tertiary h-3.5 w-3.5 cursor-pointer" />
          </Tooltip>
        </p>

        <p className="text-text-primary text-2xl font-bold">
          {percentOfIncome}
        </p>
      </Card>
    </div>
  );
}
