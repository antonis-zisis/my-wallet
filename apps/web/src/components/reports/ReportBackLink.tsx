import { Link } from 'react-router-dom';

import { ChevronLeftIcon } from '../icons';

export function ReportBackLink() {
  return (
    <div className="mb-6">
      <Link
        to="/reports"
        className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Back to Reports
      </Link>
    </div>
  );
}
