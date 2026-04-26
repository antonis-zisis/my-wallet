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
            <ChevronDownIcon className="text-border ml-auto h-5 w-5" />
          </div>
        )}
      </Card>
    );
  }

  if (reports.length === 0) {
    return (
      <Card className="mt-4">
        <div className="border-border flex flex-col items-center justify-center gap-3 rounded border-2 border-dashed py-10 text-center">
          <p className="text-text-secondary text-sm font-medium">
            No reports yet
          </p>

          <p className="text-text-tertiary text-xs">
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
        <h2 className="text-text-primary text-lg font-semibold">
          Monthly Summary
        </h2>

        <div className="flex items-center gap-2">
          {isOpen && (
            <div className="border-border flex overflow-hidden rounded border">
              {LIMIT_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLimit(option)}
                  className={`border-border cursor-pointer border-l px-2.5 py-1 text-xs font-medium transition-colors first:border-l-0 ${
                    limit === option
                      ? 'bg-brand-600 text-white'
                      : 'bg-bg-surface text-text-secondary hover:bg-bg-muted'
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
              className={`text-text-secondary h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
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
