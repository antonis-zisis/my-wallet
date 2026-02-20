import { Link } from 'react-router-dom';

import { Report } from '../../types/report';
import { formatDate } from '../../utils/formatDate';

interface ReportListProps {
  reports: Array<Report>;
  loading: boolean;
  error: boolean;
}

export function ReportList({ reports, loading, error }: ReportListProps) {
  if (loading) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400">
        Loading reports...
      </p>
    );
  }

  if (error) {
    return <p className="text-center text-red-500">Failed to load reports.</p>;
  }

  if (reports.length === 0) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400">
        No reports yet. Create your first one!
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {reports.map((report) => (
        <li key={report.id}>
          <Link
            to={`/reports/${report.id}`}
            className="flex items-center justify-between px-1 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <span className="font-medium text-gray-800 dark:text-gray-100">
              {report.title}
            </span>

            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(report.createdAt)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
