import { Link } from 'react-router-dom';

import { Report } from '../../types/report';
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
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-3 w-20" />
    </li>
  );
}

function EmptyState({ onCreateReport }: { onCreateReport?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-200 py-10 text-center dark:border-gray-700">
      <DocumentTextIcon className="size-10 text-gray-300 dark:text-gray-600" />

      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        No reports yet
      </p>

      <p className="text-xs text-gray-400 dark:text-gray-500">
        Create your first report to start tracking income and expenses.
      </p>

      {onCreateReport && (
        <button
          className="cursor-pointer text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
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
          className="divide-y divide-gray-100 dark:divide-gray-700"
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
      <ul className="divide-y divide-gray-100 dark:divide-gray-700">
        {reports.map((report) => (
          <li key={report.id}>
            <Link
              className="flex items-center justify-between gap-4 px-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
              to={`/reports/${report.id}`}
            >
              <span className="font-medium text-gray-800 dark:text-gray-100">
                {report.title}
              </span>

              <div className="flex shrink-0 items-center gap-3">
                <LockClosedIcon
                  className={`size-3.5 text-gray-400 dark:text-gray-500 ${report.isLocked ? '' : 'invisible'}`}
                />

                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {formatRelativeTime(report.updatedAt)}
                </span>

                <ChevronRightIcon className="size-4 text-gray-400 dark:text-gray-500" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
