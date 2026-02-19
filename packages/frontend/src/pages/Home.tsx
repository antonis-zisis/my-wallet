import { useQuery } from '@apollo/client/react';
import { useState } from 'react';

import { IncomeExpensesChart } from '../components/charts';
import { ReportCard } from '../components/home';
import { ChevronDownIcon, ChevronUpIcon } from '../components/icons';
import { Card } from '../components/ui';
import { HEALTH_QUERY } from '../graphql/health';
import {
  GET_REPORT,
  GET_REPORTS,
  GET_REPORTS_SUMMARY,
} from '../graphql/reports';
import { Report, ReportsData } from '../types/report';

interface ReportsSummaryData {
  reports: {
    items: Report[];
  };
}

export function Home() {
  const [isChartOpen, setIsChartOpen] = useState(true);

  const { data, loading, error } = useQuery<{ health: string }>(HEALTH_QUERY);
  const { data: reportsData } = useQuery<ReportsData>(GET_REPORTS);
  const { data: summaryData } =
    useQuery<ReportsSummaryData>(GET_REPORTS_SUMMARY);

  const reportItems = reportsData?.reports.items ?? [];
  const currentId = reportItems[0]?.id;
  const previousId = reportItems[1]?.id;

  const { data: currentData, loading: currentLoading } = useQuery<{
    report: Report;
  }>(GET_REPORT, { variables: { id: currentId }, skip: !currentId });

  const { data: previousData, loading: previousLoading } = useQuery<{
    report: Report;
  }>(GET_REPORT, { variables: { id: previousId }, skip: !previousId });

  const getStatusMessage = () => {
    if (loading) {
      return 'Connecting...';
    }

    if (error) {
      return 'Failed to connect to server';
    }

    return data?.health ?? 'Connected';
  };

  const chartReports = summaryData?.reports.items ?? [];

  return (
    <div className="py-8">
      <div className="mx-auto max-w-3xl px-4">
        <Card>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            {getStatusMessage()}
          </p>
        </Card>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Reports
            </p>

            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {reportsData?.reports.totalCount ?? '-'}
            </p>
          </Card>

          {currentLoading && !currentData ? (
            <Card>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Loading...
              </p>
            </Card>
          ) : currentData?.report ? (
            <ReportCard label="Current" report={currentData.report} />
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

          {previousLoading && !previousData ? (
            <Card>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Loading...
              </p>
            </Card>
          ) : previousData?.report ? (
            <ReportCard label="Previous" report={previousData.report} />
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

        {chartReports.length > 0 && (
          <Card className="mt-4">
            <button
              type="button"
              className="flex w-full cursor-pointer items-center justify-between"
              onClick={() => setIsChartOpen((prev) => !prev)}
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Income & Expenses
              </h2>

              {isChartOpen ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              )}
            </button>

            {isChartOpen && (
              <div className="mt-4">
                <IncomeExpensesChart reports={chartReports} />
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
