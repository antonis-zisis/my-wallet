import { ErrorBoundary } from '../components/ErrorBoundary';
import {
  IncomeExpensesSection,
  NetWorthSummaryCard,
  ReportSummaryGrid,
  SubscriptionSummarySection,
  UpcomingRenewalsCard,
} from '../components/home';
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
    previousLoading,
    previousReport,
    reportsLoading,
    totalReportsCount,
  } = useHomeData();

  const showSubscriptions = activeSubscriptions.length > 0;
  const showNetWorth = lastSnapshot !== null;

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
          <IncomeExpensesSection reports={chartReports} />
        </ErrorBoundary>
      </section>

      {showSubscriptions && (
        <>
          <Divider />
          <section>
            <SubscriptionSummarySection
              currentIncome={currentIncome}
              subscriptions={activeSubscriptions}
            />
            <UpcomingRenewalsCard subscriptions={activeSubscriptions} />
          </section>
        </>
      )}

      {showNetWorth && (
        <>
          <Divider />
          <section>
            <NetWorthSummaryCard snapshot={lastSnapshot} />
          </section>
        </>
      )}
    </PageLayout>
  );
}
