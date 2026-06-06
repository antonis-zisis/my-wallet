import { MoneyAmount } from '../ui';

interface NetWorthSnapshotModalSummaryProps {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
}

export function NetWorthSnapshotModalSummary({
  netWorth,
  totalAssets,
  totalLiabilities,
}: NetWorthSnapshotModalSummaryProps) {
  const netWorthColor =
    netWorth >= 0
      ? 'text-green-700 dark:text-green-300'
      : 'text-red-700 dark:text-red-300';

  return (
    <div className="border-border flex justify-between border-t pt-2 text-xs">
      <span className="text-green-600 dark:text-green-400">
        Assets: <MoneyAmount amount={totalAssets} />
      </span>

      <span className="text-red-600 dark:text-red-400">
        Liabilities: <MoneyAmount amount={totalLiabilities} />
      </span>

      <span className={`font-semibold ${netWorthColor}`}>
        Net Worth:{' '}
        <MoneyAmount
          amount={Math.abs(netWorth)}
          sign={netWorth >= 0 ? '' : '-'}
        />
      </span>
    </div>
  );
}
