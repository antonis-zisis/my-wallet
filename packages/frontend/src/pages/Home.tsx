import { useQuery } from '@apollo/client/react';

import { ErrorBoundary } from '../components/ErrorBoundary';
import {
  IncomeExpensesSection,
  NetWorthSummaryCard,
  ReportSummaryGrid,
  SubscriptionSummarySection,
  UpcomingRenewalsCard,
} from '../components/home';
import { Card } from '../components/ui';
import { HEALTH_QUERY } from '../graphql/health';
import { GET_NET_WORTH_SNAPSHOTS } from '../graphql/netWorth';
import {
  GET_REPORT,
  GET_REPORTS,
  GET_REPORTS_SUMMARY,
} from '../graphql/reports';
import { GET_SUBSCRIPTIONS } from '../graphql/subscriptions';
import { NetWorthSnapshotsData } from '../types/netWorth';
import { Report, ReportsData } from '../types/report';
import { SubscriptionsData } from '../types/subscription';

interface ReportsSummaryData {
  reports: {
    items: Array<Report>;
  };
}

export function Home() {
  const { data, loading, error } = useQuery<{ health: string }>(HEALTH_QUERY);
  const { data: reportsData } = useQuery<ReportsData>(GET_REPORTS);
  const { data: summaryData } =
    useQuery<ReportsSummaryData>(GET_REPORTS_SUMMARY);
  const { data: netWorthData } = useQuery<NetWorthSnapshotsData>(
    GET_NET_WORTH_SNAPSHOTS,
    { variables: { page: 1 } }
  );
  const { data: subscriptionsData } = useQuery<SubscriptionsData>(
    GET_SUBSCRIPTIONS,
    { variables: { page: 1, active: true } }
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
  const activeSubscriptions = subscriptionsData?.subscriptions.items ?? [];
  const currentIncome = (currentData?.report.transactions ?? [])
    .filter((tx) => tx.type === 'INCOME')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="py-8">
      <div className="mx-auto max-w-3xl px-4">
        <Card>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            {getStatusMessage()}
          </p>
        </Card>

        <ReportSummaryGrid
          totalCount={reportsData?.reports.totalCount}
          currentReport={currentData?.report}
          currentLoading={currentLoading}
          previousReport={previousData?.report}
          previousLoading={previousLoading}
        />

        <ErrorBoundary compact>
          <IncomeExpensesSection reports={chartReports} />
        </ErrorBoundary>

        {activeSubscriptions.length > 0 && (
          <>
            <SubscriptionSummarySection
              subscriptions={activeSubscriptions}
              currentIncome={currentIncome}
            />
            <UpcomingRenewalsCard subscriptions={activeSubscriptions} />
          </>
        )}

        {lastSnapshot && <NetWorthSummaryCard snapshot={lastSnapshot} />}
      </div>
    </div>
  );
}
