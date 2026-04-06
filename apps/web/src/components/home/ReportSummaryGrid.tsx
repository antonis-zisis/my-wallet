import { Report } from '../../types/report';
import { Card, Skeleton } from '../ui';
import { ReportCard } from './ReportCard';

function SkeletonCard() {
  return (
    <Card>
      <Skeleton className="mb-3 h-3 w-1/2" />
      <Skeleton className="h-7 w-2/5" />
    </Card>
  );
}

interface ReportSummaryGridProps {
  currentLoading: boolean;
  currentReport: Report | undefined;
  previousLoading: boolean;
  previousReport: Report | undefined;
  reportsLoading: boolean;
  totalCount: number | undefined;
}

export function ReportSummaryGrid({
  currentLoading,
  currentReport,
  previousLoading,
  previousReport,
  reportsLoading,
  totalCount,
}: ReportSummaryGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {reportsLoading ? (
        <SkeletonCard />
      ) : (
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Reports
          </p>

          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {totalCount ?? '-'}
          </p>
        </Card>
      )}

      {currentLoading && !currentReport ? (
        <SkeletonCard />
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
        <SkeletonCard />
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
