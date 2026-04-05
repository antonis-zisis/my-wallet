import { ErrorBoundary } from '../components/ErrorBoundary';
import { IncomeExpensesSection } from '../components/home/IncomeExpensesSection';
import { NetWorthSummaryCard } from '../components/home/NetWorthSummaryCard';
import { ReportSummaryGrid } from '../components/home/ReportSummaryGrid';
import { SubscriptionsSection } from '../components/home/SubscriptionsSection';
import { Divider, PageLayout } from '../components/ui';
import { useHomeData } from '../hooks/useHomeData';

export function Home() {
  const {
    activeSubscriptions,
    chartReports,
    currentIncome,
    currentLoading,
    currentReport,
    lastSnapshot,
    netWorthLoading,
    previousLoading,
    previousReport,
    reportsLoading,
    subscriptionsLoading,
    summaryLoading,
    totalReportsCount,
  } = useHomeData();

  return (
    <PageLayout className="space-y-10">
      <section>
        <ReportSummaryGrid
          currentLoading={currentLoading}
          currentReport={currentReport}
          previousLoading={previousLoading}
          previousReport={previousReport}
          reportsLoading={reportsLoading}
          totalCount={totalReportsCount}
        />

        <ErrorBoundary compact>
          <IncomeExpensesSection
            loading={summaryLoading}
            reports={chartReports}
          />
        </ErrorBoundary>
      </section>

      <Divider />

      <section>
        <SubscriptionsSection
          currentIncome={currentIncome}
          loading={subscriptionsLoading}
          subscriptions={activeSubscriptions}
        />
      </section>

      <Divider />

      <section>
        <NetWorthSummaryCard
          loading={netWorthLoading}
          snapshot={lastSnapshot}
        />
      </section>
    </PageLayout>
  );
}
