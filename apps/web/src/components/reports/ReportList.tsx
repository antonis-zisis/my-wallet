import { Link } from 'react-router-dom';

import { Report } from '../../types/report';
import { formatRelativeTime } from '../../utils/formatRelativeTime';
import { ChevronRightIcon } from '../icons';
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
          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
        />
      </svg>
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
