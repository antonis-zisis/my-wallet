import { type EntryDelta } from '../../types/netWorth';
import { Badge, MoneyAmount } from '../ui';

type EntryDeltaLabelProps = {
  currentAmount: number;
  entryDelta: EntryDelta;
};

export function EntryDeltaLabel({
  currentAmount,
  entryDelta,
}: EntryDeltaLabelProps) {
  if (entryDelta.isNew) {
    return (
      <Badge size="sm" variant="info">
        New
      </Badge>
    );
  }

  if (entryDelta.delta === 0) {
    return null;
  }

  const isPositive = entryDelta.delta > 0;
  const sign = isPositive ? '+' : '−';
  const colorClass = isPositive
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400';

  const previousAmount = currentAmount - entryDelta.delta;
  const percentage =
    previousAmount !== 0
      ? Math.abs((entryDelta.delta / Math.abs(previousAmount)) * 100)
      : null;

  return (
    <span className={`text-xs font-medium ${colorClass}`}>
      <MoneyAmount amount={Math.abs(entryDelta.delta)} sign={sign} />
      {percentage != null && (
        <span className="ml-1 opacity-70">
          ({sign}
          {percentage.toFixed(1)}%)
        </span>
      )}
    </span>
  );
}
