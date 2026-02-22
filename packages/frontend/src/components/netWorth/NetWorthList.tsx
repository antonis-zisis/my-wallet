import { Link } from 'react-router-dom';

import { NetWorthSnapshot } from '../../types/netWorth';
import { formatDate } from '../../utils/formatDate';
import { formatMoney } from '../../utils/formatMoney';
import { Dropdown } from '../ui/Dropdown';

interface NetWorthListProps {
  snapshots: Array<NetWorthSnapshot>;
  loading: boolean;
  error: boolean;
  onDelete: (snapshot: NetWorthSnapshot) => void;
}

export function NetWorthList({
  snapshots,
  loading,
  error,
  onDelete,
}: NetWorthListProps) {
  if (loading) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400">
        Loading snapshots...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-500">Failed to load snapshots.</p>
    );
  }

  if (snapshots.length === 0) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400">
        No snapshots yet. Create your first one!
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {snapshots.map((snapshot) => {
        const isPositive = snapshot.netWorth >= 0;
        return (
          <li key={snapshot.id} className="flex items-center">
            <Link
              to={`/net-worth/${snapshot.id}`}
              className="flex min-w-0 flex-1 items-center justify-between px-1 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <span className="font-medium text-gray-800 dark:text-gray-100">
                {snapshot.title}
              </span>
              <div className="flex items-center gap-4">
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
                <span className="text-sm text-gray-500 dark:text-gray-400">
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
  );
}
