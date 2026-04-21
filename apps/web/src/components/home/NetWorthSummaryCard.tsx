import { Link } from 'react-router-dom';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { NetWorthSnapshot } from '../../types/netWorth';
import { formatDate } from '../../utils/formatDate';
import { formatMoney } from '../../utils/formatMoney';
import { ChevronDownIcon } from '../icons';
import { Card, Skeleton } from '../ui';

interface NetWorthSummaryCardProps {
  loading: boolean;
  snapshot: NetWorthSnapshot | null;
}

export function NetWorthSummaryCard({
  loading,
  snapshot,
}: NetWorthSummaryCardProps) {
  const [isOpen, setIsOpen] = useLocalStorage('home.netWorth.isOpen', false);

  if (loading) {
    return (
      <Card>
        <Skeleton className="mb-3 h-5 w-1/3" />
        <Skeleton className="h-7 w-2/5" />
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
  const netWorthColor = isPositive ? 'text-green-600' : 'text-red-600';

  return (
    <Card>
      <button
        type="button"
        className="flex w-full cursor-pointer items-center gap-3"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Net Worth
        </h2>

        <span className={`text-sm font-semibold ${netWorthColor}`}>
          {sign}
          {formatMoney(Math.abs(snapshot.netWorth))} €
        </span>

        <ChevronDownIcon
          className={`ml-auto h-5 w-5 text-gray-500 transition-transform duration-300 dark:text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <div className="mt-4">
            <div className="mb-3 flex items-center justify-between">
              <Link
                to={`/net-worth/${snapshot.id}`}
                className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                {snapshot.title}
              </Link>

              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(snapshot.createdAt)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Assets
                </p>
                <p className="font-semibold text-green-600">
                  {formatMoney(snapshot.totalAssets)} €
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Liabilities
                </p>
                <p className="font-semibold text-red-600">
                  {formatMoney(snapshot.totalLiabilities)} €
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Net Worth
                </p>
                <p className={`font-bold ${netWorthColor}`}>
                  {sign}
                  {formatMoney(Math.abs(snapshot.netWorth))} €
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
