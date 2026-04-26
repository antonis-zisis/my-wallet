import { Link } from 'react-router-dom';

import { NetWorthSnapshot } from '../../types/netWorth';
import { formatDate } from '../../utils/formatDate';
import { formatMoney } from '../../utils/formatMoney';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronRightIcon,
  TrendingChartIcon,
} from '../icons';
import { Card, Skeleton } from '../ui';

interface NetWorthListProps {
  error: boolean;
  loading: boolean;
  snapshots: Array<NetWorthSnapshot>;
}

function ColumnHeaders() {
  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 border-b border-gray-100 px-3 py-2 dark:border-gray-700">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
        Snapshot
      </span>
      <span className="w-28 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
        Change
      </span>
      <span className="w-28 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
        Net Worth
      </span>
      <span className="w-20 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
        Date
      </span>
      <span className="w-4" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <li className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-3 py-3">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-3 w-20" />
      <ChevronRightIcon className="size-4 text-gray-200 dark:text-gray-700" />
    </li>
  );
}

function EmptyState({ onAdd }: { onAdd?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded border-2 border-dashed border-gray-200 py-10 text-center dark:border-gray-700">
      <TrendingChartIcon className="size-10 text-gray-300 dark:text-gray-600" />

      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        No snapshots yet
      </p>

      <p className="text-xs text-gray-400 dark:text-gray-500">
        Create your first snapshot to start tracking your net worth.
      </p>

      {onAdd && (
        <button
          className="text-brand-600 dark:text-brand-400 cursor-pointer text-sm font-semibold hover:underline"
          onClick={onAdd}
        >
          Add your first snapshot
        </button>
      )}
    </div>
  );
}

function DeltaBadge({ delta }: { delta: number | null }) {
  if (delta === null) {
    return (
      <span className="w-28 text-right text-xs text-gray-300 dark:text-gray-600">
        —
      </span>
    );
  }

  const isPositive = delta > 0;
  const isZero = delta === 0;

  if (isZero) {
    return (
      <span className="w-28 text-right text-xs text-gray-400 dark:text-gray-500">
        No change
      </span>
    );
  }

  return (
    <span
      className={`flex w-28 items-center justify-end gap-1 text-xs font-medium ${
        isPositive
          ? 'text-green-600 dark:text-green-400'
          : 'text-red-600 dark:text-red-400'
      }`}
    >
      {isPositive ? (
        <ArrowUpIcon className="size-3 shrink-0" />
      ) : (
        <ArrowDownIcon className="size-3 shrink-0" />
      )}
      {isPositive ? '+' : '-'}
      {formatMoney(Math.abs(delta))} €
    </span>
  );
}

export function NetWorthList({ error, loading, snapshots }: NetWorthListProps) {
  if (loading) {
    return (
      <Card>
        <ColumnHeaders />
        <ul
          className="divide-y divide-gray-100 dark:divide-gray-700"
          data-testid="net-worth-list-skeleton"
        >
          {Array.from({ length: 10 }).map((_, index) => (
            <SkeletonRow key={index} />
          ))}
        </ul>
      </Card>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-500">Failed to load snapshots.</p>
    );
  }

  if (snapshots.length === 0) {
    return <EmptyState />;
  }

  return (
    <Card>
      <ColumnHeaders />
      <ul className="divide-y divide-gray-100 dark:divide-gray-700">
        {snapshots.map((snapshot) => {
          const isPositiveNetWorth = snapshot.netWorth >= 0;
          const delta =
            snapshot.previousSnapshot != null
              ? snapshot.netWorth - snapshot.previousSnapshot.netWorth
              : null;

          return (
            <li key={snapshot.id}>
              <Link
                className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                to={`/net-worth/${snapshot.id}`}
              >
                <span className="font-medium text-gray-800 dark:text-gray-100">
                  {snapshot.title}
                </span>

                <DeltaBadge delta={delta} />

                <span
                  className={`w-28 text-right text-sm font-semibold ${
                    isPositiveNetWorth
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {isPositiveNetWorth ? '+' : '-'}
                  {formatMoney(Math.abs(snapshot.netWorth))} €
                </span>

                <span className="w-20 text-right text-xs text-gray-400 dark:text-gray-500">
                  {formatDate(snapshot.snapshotDate)}
                </span>

                <ChevronRightIcon className="size-4 text-gray-400 dark:text-gray-500" />
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
