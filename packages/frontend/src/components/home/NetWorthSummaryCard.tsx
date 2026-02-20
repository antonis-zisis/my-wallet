import { useState } from 'react';
import { Link } from 'react-router-dom';

import { NetWorthSnapshot } from '../../types/netWorth';
import { formatDate } from '../../utils/formatDate';
import { formatMoney } from '../../utils/formatMoney';
import { ChevronDownIcon, ChevronUpIcon } from '../icons';
import { Card } from '../ui';

export function NetWorthSummaryCard({
  snapshot,
}: {
  snapshot: NetWorthSnapshot;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const isPositive = snapshot.netWorth >= 0;
  const sign = isPositive ? '' : '-';
  const netWorthColor = isPositive ? 'text-green-600' : 'text-red-600';

  return (
    <Card className="mt-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="flex flex-1 cursor-pointer items-center gap-3"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Net Worth
          </h2>
          <span className={`text-sm font-semibold ${netWorthColor}`}>
            {sign}
            {formatMoney(Math.abs(snapshot.netWorth))} €
          </span>
        </button>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="cursor-pointer"
        >
          {isOpen ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          )}
        </button>
      </div>

      {isOpen && (
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Assets</p>
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
      )}
    </Card>
  );
}
