import { formatMoney } from '../../utils/formatMoney';
import { Card, Skeleton } from '../ui';

interface SubscriptionCostSummaryProps {
  loading?: boolean;
  totalMonthlyCost: number;
  totalYearlyCost: number;
}

export function SubscriptionCostSummary({
  loading,
  totalMonthlyCost,
  totalYearlyCost,
}: SubscriptionCostSummaryProps) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-4">
      <Card>
        {loading ? (
          <>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-7 w-24" />
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Monthly cost
            </p>
            <p className="mt-1 text-xl font-semibold text-gray-800 dark:text-gray-100">
              {formatMoney(totalMonthlyCost)} €
            </p>
          </>
        )}
      </Card>
      <Card>
        {loading ? (
          <>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-2 h-7 w-24" />
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Yearly cost
            </p>
            <p className="mt-1 text-xl font-semibold text-gray-800 dark:text-gray-100">
              {formatMoney(totalYearlyCost)} €
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
