import { NetWorthSnapshot } from '../../types/netWorth';
import { ChevronRightIcon, TrendingChartIcon } from '../icons';
import { Card, Skeleton } from '../ui';
import { NetWorthListRow } from './NetWorthListRow';

type NetWorthListProps = {
  error: boolean;
  isSearching?: boolean;
  loading: boolean;
  snapshots: Array<NetWorthSnapshot>;
};

function NoMatchesState() {
  return (
    <div className="border-border flex flex-col items-center justify-center gap-3 rounded border-2 border-dashed py-10 text-center">
      <TrendingChartIcon className="text-border-strong size-10" />

      <p className="text-text-secondary text-sm font-medium">
        No snapshots match your search
      </p>
    </div>
  );
}

function ColumnHeaders() {
  return (
    <div className="border-border hidden grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 border-b px-3 py-2 md:grid">
      <span className="text-text-secondary text-xs font-medium">Snapshot</span>
      <span className="text-text-secondary w-28 text-right text-xs font-medium">
        Change
      </span>
      <span className="text-text-secondary w-28 text-right text-xs font-medium">
        Net Worth
      </span>
      <span className="text-text-secondary w-20 text-right text-xs font-medium">
        Date
      </span>
      <span className="w-4" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <li className="flex items-center gap-3 px-1 py-3 md:grid md:grid-cols-[1fr_auto_auto_auto_auto] md:gap-4 md:px-3">
      <Skeleton className="h-6 flex-1 md:w-48 md:flex-none" />
      <Skeleton className="hidden h-4 w-28 md:block" />
      <Skeleton className="h-4 w-20 shrink-0 md:w-28" />
      <Skeleton className="hidden h-3 w-20 md:block" />
      <ChevronRightIcon className="text-border size-4 shrink-0" />
    </li>
  );
}

function EmptyState({ onAdd }: { onAdd?: () => void }) {
  return (
    <div className="border-border flex flex-col items-center justify-center gap-3 rounded border-2 border-dashed py-10 text-center">
      <TrendingChartIcon className="text-border-strong size-10" />

      <p className="text-text-secondary text-sm font-medium">
        No snapshots yet
      </p>

      <p className="text-text-tertiary text-xs">
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

export function NetWorthList({
  error,
  isSearching,
  loading,
  snapshots,
}: NetWorthListProps) {
  if (loading) {
    return (
      <Card>
        <ColumnHeaders />
        <ul
          className="divide-border divide-y"
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
    return isSearching ? <NoMatchesState /> : <EmptyState />;
  }

  return (
    <Card>
      <ColumnHeaders />
      <ul className="divide-border divide-y">
        {snapshots.map((snapshot) => (
          <NetWorthListRow key={snapshot.id} snapshot={snapshot} />
        ))}
      </ul>
    </Card>
  );
}
