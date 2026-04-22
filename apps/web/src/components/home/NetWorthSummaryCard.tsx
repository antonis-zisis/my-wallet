import { Link } from 'react-router-dom';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { NetWorthSnapshot } from '../../types/netWorth';
import { formatDate } from '../../utils/formatDate';
import { formatMoney } from '../../utils/formatMoney';
import { NetWorthSparkline } from '../charts';
import { ArrowDownIcon, ArrowUpIcon, ChevronDownIcon } from '../icons';
import { Card, Skeleton } from '../ui';

const STALE_DAYS = 45;

interface NetWorthSummaryCardProps {
  loading: boolean;
  previousSnapshot: NetWorthSnapshot | null;
  recentSnapshots: Array<NetWorthSnapshot>;
  snapshot: NetWorthSnapshot | null;
}

function daysSince(dateString: string): number {
  const value = /^\d+$/.test(dateString) ? Number(dateString) : dateString;
  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) {
    return 0;
  }
  const diffMs = Date.now() - parsed.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function formatStaleness(daysAgo: number): string {
  if (daysAgo === 0) {
    return 'Last updated today';
  }
  if (daysAgo === 1) {
    return 'Last updated yesterday';
  }
  return `Last updated ${daysAgo} days ago`;
}

export function NetWorthSummaryCard({
  loading,
  previousSnapshot,
  recentSnapshots,
  snapshot,
}: NetWorthSummaryCardProps) {
  const [isOpen, setIsOpen] = useLocalStorage('home.netWorth.isOpen', false);

  if (loading) {
    return (
      <Card>
        <Skeleton className="h-6 w-1/3" />
      </Card>
    );
  }

  if (!snapshot) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-200 py-10 text-center dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            No net worth snapshot yet
          </p>

          <p className="text-xs text-gray-400 dark:text-gray-500">
            Track your assets and liabilities to see your net worth.
          </p>

          <Link
            to="/net-worth"
            className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            Add a snapshot
          </Link>
        </div>
      </Card>
    );
  }

  const isPositive = snapshot.netWorth >= 0;
  const sign = isPositive ? '' : '-';
  const netWorthColor = isPositive
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400';

  const delta = previousSnapshot
    ? snapshot.netWorth - previousSnapshot.netWorth
    : null;
  const deltaIsPositive = delta !== null && delta >= 0;
  const deltaColor = deltaIsPositive
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400';

  const daysAgo = daysSince(snapshot.createdAt);
  const isStale = daysAgo > STALE_DAYS;

  return (
    <Card>
      <button
        aria-expanded={isOpen}
        type="button"
        className="flex w-full cursor-pointer items-center gap-3"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Net Worth
        </h2>

        <ChevronDownIcon
          className={`ml-auto h-5 w-5 text-gray-500 transition-transform duration-300 dark:text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <div className="mt-4 space-y-4">
            <div className="flex items-baseline justify-between gap-2">
              <Link
                to={`/net-worth/${snapshot.id}`}
                className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                {snapshot.title}
              </Link>

              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(snapshot.createdAt)}
              </span>
            </div>

            <div>
              <p className={`text-3xl font-bold ${netWorthColor}`}>
                {sign}
                {formatMoney(Math.abs(snapshot.netWorth))} €
              </p>

              {delta !== null && previousSnapshot && (
                <p
                  className={`mt-1 flex items-center gap-1 text-sm font-medium ${deltaColor}`}
                >
                  {deltaIsPositive ? (
                    <ArrowUpIcon className="h-4 w-4" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4" />
                  )}

                  <span>
                    {deltaIsPositive ? '+' : '-'}
                    {formatMoney(Math.abs(delta))} € since{' '}
                    {previousSnapshot.title}
                  </span>
                </p>
              )}
            </div>

            {recentSnapshots.length >= 2 && (
              <NetWorthSparkline
                isPositive={isPositive}
                snapshots={recentSnapshots}
              />
            )}

            <p
              className={`text-xs ${
                isStale
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {isStale
                ? `${formatStaleness(daysAgo)} — time for a new snapshot?`
                : formatStaleness(daysAgo)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
