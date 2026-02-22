import { useState } from 'react';

import { Report } from '../../types/report';
import { IncomeExpensesChart } from '../charts';
import { ChevronDownIcon, ChevronUpIcon } from '../icons';
import { Card } from '../ui';

const LIMIT_OPTIONS = [3, 6, 9, 12] as const;
type LimitOption = (typeof LIMIT_OPTIONS)[number];

export function IncomeExpensesSection({ reports }: { reports: Array<Report> }) {
  const [isOpen, setIsOpen] = useState(false);
  const [limit, setLimit] = useState<LimitOption>(12);

  if (reports.length === 0) {
    return null;
  }

  return (
    <Card className="mt-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="flex flex-1 cursor-pointer items-center"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Income & Expenses
          </h2>
        </button>

        <div className="flex items-center gap-2">
          {isOpen && (
            <div className="flex overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
              {LIMIT_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLimit(option)}
                  className={`cursor-pointer border-l border-gray-200 px-2.5 py-1 text-xs font-medium transition-colors first:border-l-0 dark:border-gray-700 ${
                    limit === option
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

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
      </div>

      {isOpen && (
        <div className="mt-4">
          <IncomeExpensesChart reports={reports} limit={limit} />
        </div>
      )}
    </Card>
  );
}
