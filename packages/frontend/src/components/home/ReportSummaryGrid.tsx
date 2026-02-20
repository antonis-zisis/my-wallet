import { Report } from '../../types/report';
import { Card } from '../ui';
import { ReportCard } from './ReportCard';

export function ReportSummaryGrid({
  totalCount,
  currentReport,
  currentLoading,
  previousReport,
  previousLoading,
}: {
  totalCount: number | undefined;
  currentReport: Report | undefined;
  currentLoading: boolean;
  previousReport: Report | undefined;
  previousLoading: boolean;
}) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Total Reports
        </p>

        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {totalCount ?? '-'}
        </p>
      </Card>

      {currentLoading && !currentReport ? (
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        </Card>
      ) : currentReport ? (
        <ReportCard label="Current" report={currentReport} />
      ) : (
        <Card>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Current
          </p>
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
            Add a report to view summary
          </p>
        </Card>
      )}

      {previousLoading && !previousReport ? (
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        </Card>
      ) : previousReport ? (
        <ReportCard label="Previous" report={previousReport} />
      ) : (
        <Card>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Previous
          </p>
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
            Add a report to view summary
          </p>
        </Card>
      )}
    </div>
  );
}
