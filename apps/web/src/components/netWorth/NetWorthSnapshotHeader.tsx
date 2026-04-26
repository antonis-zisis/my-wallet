import { formatDate } from '../../utils/formatDate';
import { formatMoney } from '../../utils/formatMoney';
import { Card, Dropdown } from '../ui';

interface NetWorthSnapshotHeaderProps {
  createdAt: string;
  deltaAssets?: number | null;
  deltaLiabilities?: number | null;
  deltaNetWorth?: number | null;
  isPositive: boolean;
  netWorth: number;
  onDelete: () => void;
  onDuplicate: () => void;
  onEdit: () => void;
  title: string;
  totalAssets: number;
  totalLiabilities: number;
  updatedAt: string;
}

function DeltaLabel({
  currentValue,
  delta,
  invertColors = false,
}: {
  currentValue: number;
  delta: number;
  invertColors?: boolean;
}) {
  const isPositive = delta > 0;
  const sign = isPositive ? '+' : '−';
  const isGood = invertColors ? !isPositive : isPositive;
  const colorClass = isGood
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400';

  const previousValue = currentValue - delta;
  const percentage =
    previousValue !== 0
      ? Math.abs((delta / Math.abs(previousValue)) * 100)
      : null;

  return (
    <p className={`mt-1 text-xs font-medium ${colorClass}`}>
      {sign}
      {formatMoney(Math.abs(delta))} €
      {percentage != null && (
        <span className="ml-1 opacity-70">
          ({sign}
          {percentage.toFixed(1)}%)
        </span>
      )}
    </p>
  );
}

export function NetWorthSnapshotHeader({
  createdAt,
  deltaAssets,
  deltaLiabilities,
  deltaNetWorth,
  isPositive,
  netWorth,
  onDelete,
  onDuplicate,
  onEdit,
  title,
  totalAssets,
  totalLiabilities,
  updatedAt,
}: NetWorthSnapshotHeaderProps) {
  const netWorthColorClass = isPositive
    ? 'text-brand-600 dark:text-brand-400'
    : 'text-orange-600 dark:text-orange-400';

  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-text-primary text-2xl font-bold">{title}</h1>

          <p className="text-text-tertiary mt-1 text-xs">
            Created {formatDate(createdAt)} · Updated {formatDate(updatedAt)}
          </p>
        </div>

        <Dropdown
          items={[
            { label: 'Edit', onClick: onEdit },
            { label: 'Duplicate', onClick: onDuplicate },
            { label: 'Delete', onClick: onDelete, variant: 'danger' },
          ]}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <p className="text-text-secondary text-sm">Net Worth</p>

          <p className={`text-2xl font-bold ${netWorthColorClass}`}>
            {isPositive ? '' : '-'}
            {formatMoney(Math.abs(netWorth))} €
          </p>

          {deltaNetWorth != null && deltaNetWorth !== 0 && (
            <DeltaLabel currentValue={netWorth} delta={deltaNetWorth} />
          )}
        </Card>

        <Card>
          <p className="text-text-secondary text-sm">Total Assets</p>

          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatMoney(totalAssets)} €
          </p>

          {deltaAssets != null && deltaAssets !== 0 && (
            <DeltaLabel currentValue={totalAssets} delta={deltaAssets} />
          )}
        </Card>

        <Card>
          <p className="text-text-secondary text-sm">Total Liabilities</p>

          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatMoney(totalLiabilities)} €
          </p>

          {deltaLiabilities != null && deltaLiabilities !== 0 && (
            <DeltaLabel
              currentValue={totalLiabilities}
              delta={deltaLiabilities}
              invertColors
            />
          )}
        </Card>
      </div>
    </>
  );
}
