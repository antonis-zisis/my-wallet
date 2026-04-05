import { Link } from 'react-router-dom';

import { ChevronLeftIcon } from '../icons';

export function ReportBackLink() {
  return (
    <div className="mb-6">
      <Link
        to="/reports"
        className="inline-flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Back to Reports
      </Link>
    </div>
  );
}
