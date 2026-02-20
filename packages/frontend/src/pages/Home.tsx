import { useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { IncomeExpensesChart } from '../components/charts';
import { ReportCard } from '../components/home';
import { ChevronDownIcon, ChevronUpIcon } from '../components/icons';
import { Card } from '../components/ui';
import { HEALTH_QUERY } from '../graphql/health';
import { GET_NET_WORTH_SNAPSHOTS } from '../graphql/netWorth';
import {
  GET_REPORT,
  GET_REPORTS,
  GET_REPORTS_SUMMARY,
} from '../graphql/reports';
import { NetWorthSnapshotsData } from '../types/netWorth';
import { Report, ReportsData } from '../types/report';
import { formatDate } from '../utils/formatDate';
import { formatMoney } from '../utils/formatMoney';

interface ReportsSummaryData {
  reports: {
    items: Array<Report>;
  };
}

const LIMIT_OPTIONS = [3, 6, 9, 12] as const;
type LimitOption = (typeof LIMIT_OPTIONS)[number];

export function Home() {
  const [isChartOpen, setIsChartOpen] = useState(true);
  const [isNetWorthOpen, setIsNetWorthOpen] = useState(false);
  const [limit, setLimit] = useState<LimitOption>(12);

  const { data, loading, error } = useQuery<{ health: string }>(HEALTH_QUERY);
  const { data: reportsData } = useQuery<ReportsData>(GET_REPORTS);
  const { data: summaryData } =
    useQuery<ReportsSummaryData>(GET_REPORTS_SUMMARY);
  const { data: netWorthData } = useQuery<NetWorthSnapshotsData>(
    GET_NET_WORTH_SNAPSHOTS,
    { variables: { page: 1 } }
  );

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
  const lastSnapshot = netWorthData?.netWorthSnapshots.items[0] ?? null;

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
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="flex flex-1 cursor-pointer items-center"
                onClick={() => setIsChartOpen((prev) => !prev)}
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Income & Expenses
                </h2>
              </button>

              <div className="flex items-center gap-2">
                {isChartOpen && (
                  <div className="flex overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                    {LIMIT_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setLimit(option)}
                        className={`cursor-pointer border-l border-gray-200 px-2.5 py-1 text-xs font-medium transition-colors first:border-l-0 dark:border-gray-700 ${
                          limit === option
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsChartOpen((prev) => !prev)}
                  className="cursor-pointer"
                >
                  {isChartOpen ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {isChartOpen && (
              <div className="mt-4">
                <IncomeExpensesChart reports={chartReports} limit={limit} />
              </div>
            )}
          </Card>
        )}

        {lastSnapshot &&
          (() => {
            const isPositive = lastSnapshot.netWorth >= 0;
            const sign = isPositive ? '' : '-';
            const netWorthColor = isPositive
              ? 'text-green-600'
              : 'text-red-600';

            return (
              <Card className="mt-4">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    className="flex flex-1 cursor-pointer items-center gap-3"
                    onClick={() => setIsNetWorthOpen((prev) => !prev)}
                  >
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Net Worth
                    </h2>
                    <span className={`text-sm font-semibold ${netWorthColor}`}>
                      {sign}
                      {formatMoney(Math.abs(lastSnapshot.netWorth))} €
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsNetWorthOpen((prev) => !prev)}
                    className="cursor-pointer"
                  >
                    {isNetWorthOpen ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                </div>

                {isNetWorthOpen && (
                  <div className="mt-4">
                    <div className="mb-3 flex items-center justify-between">
                      <Link
                        to={`/net-worth/${lastSnapshot.id}`}
                        className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {lastSnapshot.title}
                      </Link>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(lastSnapshot.createdAt)}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Assets
                        </p>
                        <p className="font-semibold text-green-600">
                          {formatMoney(lastSnapshot.totalAssets)} €
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Liabilities
                        </p>
                        <p className="font-semibold text-red-600">
                          {formatMoney(lastSnapshot.totalLiabilities)} €
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Net Worth
                        </p>
                        <p className={`font-bold ${netWorthColor}`}>
                          {sign}
                          {formatMoney(Math.abs(lastSnapshot.netWorth))} €
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })()}
      </div>
    </div>
  );
}
