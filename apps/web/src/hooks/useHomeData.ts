import { useQuery } from '@apollo/client/react';

import { GET_NET_WORTH_SNAPSHOTS } from '../graphql/netWorth';
import {
  GET_REPORT,
  GET_REPORTS,
  GET_REPORTS_SUMMARY,
} from '../graphql/reports';
import { GET_SUBSCRIPTIONS } from '../graphql/subscriptions';
import { NetWorthSnapshotsData } from '../types/netWorth';
import { Report, ReportsData, ReportsSummaryData } from '../types/report';
import { SubscriptionsData } from '../types/subscription';

export function useHomeData() {
  const { data: reportsData, loading: reportsLoading } =
    useQuery<ReportsData>(GET_REPORTS);
  const { data: summaryData, loading: summaryLoading } =
    useQuery<ReportsSummaryData>(GET_REPORTS_SUMMARY);
  const { data: netWorthData, loading: netWorthLoading } =
    useQuery<NetWorthSnapshotsData>(GET_NET_WORTH_SNAPSHOTS, {
      variables: { page: 1 },
    });
  const { data: subscriptionsData, loading: subscriptionsLoading } =
    useQuery<SubscriptionsData>(GET_SUBSCRIPTIONS, {
      variables: { page: 1, active: true },
    });

  const reportItems = reportsData?.reports.items ?? [];
  const currentId = reportItems[0]?.id;
  const previousId = reportItems[1]?.id;

  const { data: currentData, loading: currentLoading } = useQuery<{
    report: Report;
  }>(GET_REPORT, { variables: { id: currentId }, skip: !currentId });

  const { data: previousData, loading: previousLoading } = useQuery<{
    report: Report;
  }>(GET_REPORT, { variables: { id: previousId }, skip: !previousId });

  const activeSubscriptions = subscriptionsData?.subscriptions.items ?? [];
  const currentIncome = (currentData?.report.transactions ?? [])
    .filter((transaction) => transaction.type === 'INCOME')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return {
    activeSubscriptions,
    chartReports: summaryData?.reports.items ?? [],
    currentIncome,
    currentLoading,
    currentReport: currentData?.report,
    lastSnapshot: netWorthData?.netWorthSnapshots.items[0] ?? null,
    netWorthLoading,
    previousLoading,
    previousReport: previousData?.report,
    reportsLoading,
    subscriptionsLoading,
    summaryLoading,
    totalReportsCount: reportsData?.reports.totalCount,
  };
}
