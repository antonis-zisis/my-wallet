import { formatDate } from '../../utils/formatDate';
import { formatMoney } from '../../utils/formatMoney';
import { InfoIcon } from '../icons';
import { Card, Skeleton, Tooltip } from '../ui';

interface NextRenewal {
  name: string;
  amount: number;
  date: Date;
}

interface MostExpensive {
  monthlyCost: number;
  name: string;
}

interface SubscriptionCostSummaryProps {
  loading?: boolean;
  mostExpensive: MostExpensive | null;
  nextRenewal: NextRenewal | null;
  renewingThisMonthTotal: number;
  totalMonthlyCost: number;
  totalYearlyCost: number;
}

interface TileProps {
  label: string;
  loading?: boolean;
  primary: string;
  secondary?: string;
  tooltip?: string;
}

function Tile({ label, loading, primary, secondary, tooltip }: TileProps) {
  return (
    <Card>
      {loading ? (
        <>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="mt-2 h-7 w-24" />
        </>
      ) : (
        <>
          <p className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <span>{label}</span>
            {tooltip && (
              <Tooltip content={tooltip}>
                <InfoIcon className="h-3.5 w-3.5 shrink-0 cursor-pointer text-gray-400 dark:text-gray-500" />
              </Tooltip>
            )}
          </p>

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
  loading,
  mostExpensive,
  nextRenewal,
  renewingThisMonthTotal,
  totalMonthlyCost,
  totalYearlyCost,
}: SubscriptionCostSummaryProps) {
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(
    new Date()
  );

  return (
    <div className="mb-6 space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
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
          label={
            mostExpensive
              ? `Most expensive · ${formatMoney(mostExpensive.monthlyCost)} € / mo`
              : 'Most expensive'
          }
          loading={loading}
          primary={mostExpensive ? mostExpensive.name : '—'}
          tooltip={
            mostExpensive
              ? `Yearly cost: ${formatMoney(mostExpensive.monthlyCost * 12)} €`
              : undefined
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Tile
          label={
            nextRenewal
              ? `Next renewal · ${formatDate(nextRenewal.date)}`
              : 'Next renewal'
          }
          loading={loading}
          primary={
            nextRenewal
              ? `${nextRenewal.name} · ${formatMoney(nextRenewal.amount)} €`
              : '—'
          }
          secondary={nextRenewal ? undefined : 'No upcoming renewals'}
        />

        <Tile
          label="Renewing this month"
          loading={loading}
          primary={
            renewingThisMonthTotal > 0
              ? `${formatMoney(renewingThisMonthTotal)} €`
              : '—'
          }
          secondary={renewingThisMonthTotal > 0 ? undefined : 'Nothing due'}
          tooltip={`Total charged in ${monthName}. Monthly subscriptions renew every month; yearly subscriptions count only when their anniversary falls in this month.`}
        />
      </div>
    </div>
  );
}
