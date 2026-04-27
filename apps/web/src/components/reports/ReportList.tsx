import { Link } from 'react-router-dom';

import { Report } from '../../types/report';
import { formatMoney } from '../../utils/formatMoney';
import { formatRelativeTime } from '../../utils/formatRelativeTime';
import { ChevronRightIcon, DocumentTextIcon, LockClosedIcon } from '../icons';
import { Card, Skeleton } from '../ui';

interface ReportListProps {
  error: boolean;
  loading: boolean;
  onCreateReport?: () => void;
  reports: Array<Report>;
}

function SkeletonRow() {
  return (
    <li className="flex items-center justify-between gap-4 px-3 py-3">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-4 w-16" />
    </li>
  );
}

function EmptyState({ onCreateReport }: { onCreateReport?: () => void }) {
  return (
    <div className="border-border flex flex-col items-center justify-center gap-3 rounded border-2 border-dashed py-10 text-center">
      <DocumentTextIcon className="text-border-strong size-10" />

      <p className="text-text-secondary text-sm font-medium">No reports yet</p>

      <p className="text-text-tertiary text-xs">
        Create your first report to start tracking income and expenses.
      </p>

      {onCreateReport && (
        <button
          className="text-brand-600 dark:text-brand-400 cursor-pointer text-sm font-semibold hover:underline"
          onClick={onCreateReport}
        >
          Create your first report
        </button>
      )}
    </div>
  );
}

export function ReportList({
  error,
  loading,
  onCreateReport,
  reports,
}: ReportListProps) {
  if (loading) {
    return (
      <Card>
        <ul
          className="divide-border divide-y"
          data-testid="report-list-skeleton"
        >
          {Array.from({ length: 10 }).map((_, index) => (
            <SkeletonRow key={index} />
          ))}
        </ul>
      </Card>
    );
  }

  if (error) {
    return <p className="text-center text-red-500">Failed to load reports.</p>;
  }

  if (reports.length === 0) {
    return <EmptyState onCreateReport={onCreateReport} />;
  }

  return (
    <Card>
      <ul className="divide-border divide-y">
        {reports.map((report) => {
          const netBalance = report.netBalance ?? 0;
          const transactionCount = report.transactionCount ?? 0;

          return (
            <li key={report.id}>
              <Link
                className="flex items-center justify-between gap-4 px-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                to={`/reports/${report.id}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-text-primary font-medium">
                    {report.title}
                  </p>
                  <p className="text-text-tertiary mt-0.5 text-xs">
                    {transactionCount}{' '}
                    {transactionCount === 1 ? 'transaction' : 'transactions'} ·{' '}
                    {formatRelativeTime(report.updatedAt)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={`text-sm font-medium tabular-nums ${
                      netBalance >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-500 dark:text-red-400'
                    }`}
                  >
                    {netBalance >= 0 ? '+' : ''}
                    {formatMoney(netBalance)}
                  </span>

                  <LockClosedIcon
                    className={`text-text-tertiary size-3.5 ${report.isLocked ? '' : 'invisible'}`}
                  />

                  <ChevronRightIcon className="text-text-tertiary size-4" />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
