import { useQuery } from '@apollo/client/react';

import { ArrowDownIcon, ArrowUpIcon } from '../components/icons';
import { Badge, Card } from '../components/ui';
import { HEALTH_QUERY } from '../graphql/health';
import { GET_REPORT, GET_REPORTS } from '../graphql/reports';
import { Transaction } from '../types/transaction';
import { formatMoney } from '../utils/formatMoney';

interface Report {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  transactions: Transaction[];
}

interface ReportsData {
  reports: {
    items: {
      id: string;
      title: string;
      createdAt: string;
      updatedAt: string;
    }[];
    totalCount: number;
  };
}

function ReportCard({ label, report }: { label: string; report: Report }) {
  const totalIncome = report.transactions
    .filter((tx) => tx.type === 'INCOME')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = report.transactions
    .filter((tx) => tx.type === 'EXPENSE')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <Card>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">
          {report.title}
        </span>

        <Badge variant="info">{label}</Badge>
      </div>

      <div className="mt-2 flex items-center gap-3">
        <p className="flex items-center gap-1 text-sm font-semibold text-green-600 dark:text-green-400">
          <ArrowUpIcon className="size-4" />
          {formatMoney(totalIncome)} &euro;
        </p>

        <p className="flex items-center gap-1 text-sm font-semibold text-red-600 dark:text-red-400">
          <ArrowDownIcon className="size-4" />
          {formatMoney(totalExpenses)} &euro;
        </p>
      </div>
    </Card>
  );
}

export function Home() {
  const { data, loading, error } = useQuery<{ health: string }>(HEALTH_QUERY);
  const { data: reportsData } = useQuery<ReportsData>(GET_REPORTS);

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

          {currentLoading && (
            <Card>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Loading...
              </p>
            </Card>
          )}

          {currentData?.report && (
            <ReportCard label="Current" report={currentData.report} />
          )}

          {previousLoading && (
            <Card>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Loading...
              </p>
            </Card>
          )}

          {previousData?.report && (
            <ReportCard label="Previous" report={previousData.report} />
          )}
        </div>
      </div>
    </div>
  );
}
