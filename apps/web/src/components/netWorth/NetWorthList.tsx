import { Link } from 'react-router-dom';

import { NetWorthSnapshot } from '../../types/netWorth';
import { formatDate } from '../../utils/formatDate';
import { formatMoney } from '../../utils/formatMoney';
import { Card, Dropdown, Skeleton } from '../ui';

interface NetWorthListProps {
  snapshots: Array<NetWorthSnapshot>;
  loading: boolean;
  error: boolean;
  onDelete: (snapshot: NetWorthSnapshot) => void;
}

function SkeletonRow() {
  return (
    <li className="flex items-center justify-between gap-4 px-3 py-3">
      <Skeleton className="h-4 w-48" />
      <div className="flex items-center gap-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
    </li>
  );
}

function EmptyState({ onAdd }: { onAdd?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-200 py-10 text-center dark:border-gray-700">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-10 text-gray-300 dark:text-gray-600"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
        />
      </svg>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        No snapshots yet
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Create your first snapshot to start tracking your net worth.
      </p>
      {onAdd && (
        <button
          className="cursor-pointer text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
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
  loading,
  onDelete,
  snapshots,
}: NetWorthListProps) {
  if (loading) {
    return (
      <Card>
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
      <ul className="divide-y divide-gray-100 dark:divide-gray-700">
        {snapshots.map((snapshot) => {
          const isPositive = snapshot.netWorth >= 0;
          return (
            <li key={snapshot.id} className="flex items-center">
              <Link
                className="flex min-w-0 flex-1 items-center justify-between gap-4 px-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                to={`/net-worth/${snapshot.id}`}
              >
                <span className="font-medium text-gray-800 dark:text-gray-100">
                  {snapshot.title}
                </span>
                <div className="flex shrink-0 items-center gap-6">
                  <span
                    className={`text-sm font-semibold ${
                      isPositive
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {isPositive ? '+' : '-'}
                    {formatMoney(Math.abs(snapshot.netWorth))} €
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formatDate(snapshot.createdAt)}
                  </span>
                </div>
              </Link>
              <Dropdown
                items={[
                  {
                    label: 'Delete',
                    onClick: () => onDelete(snapshot),
                    variant: 'danger',
                  },
                ]}
              />
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
