import { formatDate } from '../../utils/formatDate';
import { formatMoney } from '../../utils/formatMoney';
import { Card, Skeleton } from '../ui';

interface NextRenewal {
  name: string;
  amount: number;
  date: Date;
}

interface SubscriptionCostSummaryProps {
  activeCount: number;
  loading?: boolean;
  nextRenewal: NextRenewal | null;
  totalMonthlyCost: number;
  totalYearlyCost: number;
}

interface TileProps {
  label: string;
  loading?: boolean;
  primary: string;
  secondary?: string;
}

function Tile({ label, loading, primary, secondary }: TileProps) {
  return (
    <Card>
      {loading ? (
        <>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="mt-2 h-7 w-24" />
        </>
      ) : (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>

          <p className="mt-1 text-xl font-semibold text-gray-800 dark:text-gray-100">
            {primary}
          </p>

          {secondary && (
            <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
              {secondary}
            </p>
          )}
        </>
      )}
    </Card>
  );
}

export function SubscriptionCostSummary({
  activeCount,
  loading,
  nextRenewal,
  totalMonthlyCost,
  totalYearlyCost,
}: SubscriptionCostSummaryProps) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Tile
        label="Active"
        loading={loading}
        primary={`${activeCount}`}
        secondary={activeCount === 1 ? 'subscription' : 'subscriptions'}
      />

      <Tile
        label="Monthly cost"
        loading={loading}
        primary={`${formatMoney(totalMonthlyCost)} €`}
      />

      <Tile
        label="Yearly cost"
        loading={loading}
        primary={`${formatMoney(totalYearlyCost)} €`}
      />

      <Tile
        label="Next renewal"
        loading={loading}
        primary={nextRenewal ? formatDate(nextRenewal.date) : '—'}
        secondary={
          nextRenewal
            ? `${nextRenewal.name} · ${formatMoney(nextRenewal.amount)} €`
            : 'No upcoming renewals'
        }
      />
    </div>
  );
}
