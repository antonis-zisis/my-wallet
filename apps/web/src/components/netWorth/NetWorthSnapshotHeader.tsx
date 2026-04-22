import { formatDate } from '../../utils/formatDate';
import { formatMoney } from '../../utils/formatMoney';
import { Button, Card } from '../ui';

interface NetWorthSnapshotHeaderProps {
  snapshotDate: string;
  deltaAssets?: number | null;
  deltaLiabilities?: number | null;
  deltaNetWorth?: number | null;
  isPositive: boolean;
  netWorth: number;
  onEdit?: () => void;
  title: string;
  totalAssets: number;
  totalLiabilities: number;
}

function DeltaLabel({ delta }: { delta: number }) {
  const isPositive = delta > 0;
  const sign = isPositive ? '+' : '−';
  const colorClass = isPositive
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400';

  return (
    <p className={`mt-1 text-xs font-medium ${colorClass}`}>
      {sign}
      {formatMoney(Math.abs(delta))} €
    </p>
  );
}

export function NetWorthSnapshotHeader({
  deltaAssets,
  deltaLiabilities,
  deltaNetWorth,
  isPositive,
  netWorth,
  onEdit,
  snapshotDate,
  title,
  totalAssets,
  totalLiabilities,
}: NetWorthSnapshotHeaderProps) {
  return (
    <Card className="p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {title}
          </h1>

          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            {formatDate(snapshotDate)}
          </p>
        </div>

        {onEdit && (
          <Button size="sm" variant="secondary" onClick={onEdit}>
            Edit
          </Button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Assets
          </p>

          <p className="text-xl font-semibold text-green-600 dark:text-green-400">
            {formatMoney(totalAssets)} €
          </p>

          {deltaAssets != null && deltaAssets !== 0 && (
            <DeltaLabel delta={deltaAssets} />
          )}
        </div>

        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Liabilities
          </p>

          <p className="text-xl font-semibold text-red-600 dark:text-red-400">
            {formatMoney(totalLiabilities)} €
          </p>

          {deltaLiabilities != null && deltaLiabilities !== 0 && (
            <DeltaLabel delta={deltaLiabilities} />
          )}
        </div>

        <div
          className={`rounded-lg p-4 ${
            isPositive
              ? 'bg-blue-50 dark:bg-blue-900/20'
              : 'bg-orange-50 dark:bg-orange-900/20'
          }`}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">Net Worth</p>

          <p
            className={`text-xl font-semibold ${
              isPositive
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-orange-600 dark:text-orange-400'
            }`}
          >
            {isPositive ? '' : '-'}
            {formatMoney(Math.abs(netWorth))} €
          </p>

          {deltaNetWorth != null && deltaNetWorth !== 0 && (
            <DeltaLabel delta={deltaNetWorth} />
          )}
        </div>
      </div>
    </Card>
  );
}
