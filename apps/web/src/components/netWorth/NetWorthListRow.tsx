import { Link } from 'react-router';

import { useIsMobileViewport } from '../../hooks/useIsMobileViewport';
import { NetWorthSnapshot } from '../../types/netWorth';
import { formatDate } from '../../utils/formatDate';
import { ArrowDownIcon, ArrowUpIcon, ChevronRightIcon } from '../icons';
import { MoneyAmount } from '../ui';

type NetWorthListRowProps = {
  snapshot: NetWorthSnapshot;
};

type DeltaBadgeProps = {
  className?: string;
  delta: number | null;
};

function DeltaBadge({ className = '', delta }: DeltaBadgeProps) {
  if (delta === null) {
    return <span className={`text-border-strong text-xs ${className}`}>—</span>;
  }

  if (delta === 0) {
    return (
      <span className={`text-text-tertiary text-xs ${className}`}>
        No change
      </span>
    );
  }

  const isPositive = delta > 0;

  return (
    <span
      className={`flex items-center justify-end gap-1 text-xs font-medium ${
        isPositive
          ? 'text-green-600 dark:text-green-400'
          : 'text-red-600 dark:text-red-400'
      } ${className}`}
    >
      {isPositive ? (
        <ArrowUpIcon className="size-3 shrink-0" />
      ) : (
        <ArrowDownIcon className="size-3 shrink-0" />
      )}
      <MoneyAmount amount={Math.abs(delta)} sign={isPositive ? '+' : '-'} />
    </span>
  );
}

export function NetWorthListRow({ snapshot }: NetWorthListRowProps) {
  const isMobile = useIsMobileViewport();

  const isPositiveNetWorth = snapshot.netWorth >= 0;
  const delta =
    snapshot.previousSnapshot != null
      ? snapshot.netWorth - snapshot.previousSnapshot.netWorth
      : null;

  const netWorthColorClass = isPositiveNetWorth
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400';

  if (isMobile) {
    return (
      <li>
        <Link
          className="flex items-center gap-3 px-1 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
          to={`/net-worth/${snapshot.id}`}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-text-primary min-w-0 truncate font-medium">
                {snapshot.title}
              </p>

              <MoneyAmount
                amount={Math.abs(snapshot.netWorth)}
                sign={isPositiveNetWorth ? '+' : '-'}
                className={`shrink-0 text-sm font-semibold ${netWorthColorClass}`}
              />
            </div>

            <div className="mt-1 flex items-center gap-2">
              <span className="text-text-tertiary shrink-0 text-xs">
                {formatDate(snapshot.snapshotDate)}
              </span>

              <DeltaBadge className="whitespace-nowrap" delta={delta} />
            </div>
          </div>

          <ChevronRightIcon className="text-text-tertiary size-4 shrink-0" />
        </Link>
      </li>
    );
  }

  return (
    <li>
      <Link
        className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
        to={`/net-worth/${snapshot.id}`}
      >
        <span className="text-text-primary font-medium">{snapshot.title}</span>

        <DeltaBadge className="w-28 text-right" delta={delta} />

        <MoneyAmount
          amount={Math.abs(snapshot.netWorth)}
          sign={isPositiveNetWorth ? '+' : '-'}
          className={`w-28 text-right text-sm font-semibold ${netWorthColorClass}`}
        />

        <span className="text-text-tertiary w-20 text-right text-xs">
          {formatDate(snapshot.snapshotDate)}
        </span>

        <ChevronRightIcon className="text-text-tertiary size-4" />
      </Link>
    </li>
  );
}
