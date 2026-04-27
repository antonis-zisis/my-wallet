import { Link } from 'react-router-dom';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Report } from '../../types/report';
import { IncomeExpensesChart } from '../charts';
import { ChevronDownIcon } from '../icons';
import { Card, Skeleton } from '../ui';

const LIMIT_OPTIONS = [3, 6, 9, 12] as const;
type LimitOption = (typeof LIMIT_OPTIONS)[number];

interface IncomeExpensesSectionProps {
  loading: boolean;
  reports: Array<Report>;
}

export function IncomeExpensesSection({
  loading,
  reports,
}: IncomeExpensesSectionProps) {
  const [isOpen, setIsOpen] = useLocalStorage(
    'home.incomeExpenses.isOpen',
    true
  );

  const [limit, setLimit] = useLocalStorage<LimitOption>(
    'home.incomeExpenses.limit',
    12
  );

  if (loading) {
    return (
      <Card className="mt-4">
        {isOpen ? (
          <Skeleton className="h-86 w-full" />
        ) : (
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-40" />
            <ChevronDownIcon className="ml-auto h-5 w-5 text-gray-200 dark:text-gray-700" />
          </div>
        )}
      </Card>
    );
  }

  if (reports.length === 0) {
    return (
      <Card className="mt-4">
        <div className="flex flex-col items-center justify-center gap-3 rounded border-2 border-dashed border-gray-200 py-10 text-center dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            No reports yet
          </p>

          <p className="text-xs text-gray-400 dark:text-gray-500">
            Add a report to see your income and expenses over time.
          </p>

          <Link
            to="/reports"
            className="text-brand-600 dark:text-brand-400 text-sm font-semibold hover:underline"
          >
            Add a report
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Monthly Summary
        </h2>

        <div className="flex items-center gap-2">
          {isOpen && (
            <div className="flex overflow-hidden rounded border border-gray-200 dark:border-gray-700">
              {LIMIT_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLimit(option)}
                  className={`cursor-pointer border-l border-gray-200 px-2.5 py-1 text-xs font-medium transition-colors first:border-l-0 dark:border-gray-700 ${
                    limit === option
                      ? 'bg-brand-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          <button
            aria-expanded={isOpen}
            aria-label="Monthly Summary"
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="cursor-pointer"
          >
            <ChevronDownIcon
              className={`h-5 w-5 text-gray-500 transition-transform duration-300 dark:text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      <div
        className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <div className="mt-4">
            <IncomeExpensesChart limit={limit} reports={reports} />
          </div>
        </div>
      </div>
    </Card>
  );
}
