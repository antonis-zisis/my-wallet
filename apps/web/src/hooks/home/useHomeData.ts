import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';

import { GET_CONTRACTS } from '../../graphql/contracts';
import { GET_NET_WORTH_SNAPSHOTS } from '../../graphql/netWorth';
import {
  GET_REPORT,
  GET_REPORTS,
  GET_REPORTS_SUMMARY,
} from '../../graphql/reports';
import { GET_SUBSCRIPTIONS } from '../../graphql/subscriptions';
import { GET_EXPENSE_CATEGORY_TOTALS_BY_MONTH } from '../../graphql/transactions';
import { ContractsData } from '../../types/contract';
import { NetWorthSnapshotsData } from '../../types/netWorth';
import { Report, ReportsData, ReportsSummaryData } from '../../types/report';
import { SubscriptionsData } from '../../types/subscription';
import { ExpenseCategoryTotalsData } from '../../types/transaction';
import { computeExpiringSoon } from '../contracts/selectors/computeExpiringSoon';
import { buildSpendingInsights } from '../transactions/selectors/buildSpendingInsights';
import { MAX_WINDOW_MONTHS } from '../transactions/useCategoryTrendsData';

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
  const { data: contractsData, loading: contractsLoading } =
    useQuery<ContractsData>(GET_CONTRACTS, {
      variables: {
        page: 1,
        expired: false,
        sortBy: 'END_DATE',
        sortOrder: 'ASC',
      },
    });
  const { data: categoryTotalsData } = useQuery<ExpenseCategoryTotalsData>(
    GET_EXPENSE_CATEGORY_TOTALS_BY_MONTH,
    { variables: { months: MAX_WINDOW_MONTHS } }
  );

  const nonEmptyReportItems = (reportsData?.reports.items ?? []).filter(
    (report) => (report.transactionCount ?? 0) > 0
  );
  const currentId = nonEmptyReportItems[0]?.id;
  const previousId = nonEmptyReportItems[1]?.id;

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

  const snapshotItems = netWorthData?.netWorthSnapshots.items ?? [];
  const recentSnapshots = snapshotItems.slice(0, 6).reverse();

  const expiringContracts = computeExpiringSoon(
    contractsData?.contracts.items ?? []
  );

  const totals = useMemo(
    () => categoryTotalsData?.expenseCategoryTotalsByMonth ?? [],
    [categoryTotalsData]
  );

  const {
    baselineMonthCount,
    insights,
    month: spendingInsightMonth,
  } = useMemo(
    () => buildSpendingInsights({ now: new Date(), totals }),
    [totals]
  );

  return {
    activeSubscriptions,
    contractsLoading,
    hasContracts: (contractsData?.contracts.totalCount ?? 0) > 0,
    expiringContracts,
    chartReports: (summaryData?.reports.items ?? []).filter(
      (report) => (report.transactions?.length ?? 0) > 0
    ),
    currentIncome,
    currentLoading,
    currentReport: currentData?.report,
    lastSnapshot: snapshotItems[0] ?? null,
    netWorthLoading,
    previousLoading,
    previousReport: previousData?.report,
    previousSnapshot: snapshotItems[1] ?? null,
    recentSnapshots,
    reportsLoading,
    spendingInsight: insights[0] ?? null,
    spendingInsightBaselineMonths: baselineMonthCount,
    spendingInsightMonth,
    subscriptionsLoading,
    summaryLoading,
    totalReportsCount: reportsData?.reports.totalCount,
  };
}
