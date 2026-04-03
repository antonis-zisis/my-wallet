import { ErrorBoundary } from '../components/ErrorBoundary';
import {
  IncomeExpensesSection,
  NetWorthSummaryCard,
  ReportSummaryGrid,
  SubscriptionSummarySection,
  UpcomingRenewalsCard,
} from '../components/home';
import { Divider } from '../components/ui';
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
    totalReportsCount,
  } = useHomeData();

  const showSubscriptions = activeSubscriptions.length > 0;
  const showNetWorth = lastSnapshot !== null;

  return (
    <div className="py-8">
      <div className="mx-auto max-w-5xl space-y-10 px-4">
        <section>
          <ReportSummaryGrid
            totalCount={totalReportsCount}
            currentReport={currentReport}
            currentLoading={currentLoading}
            previousReport={previousReport}
            previousLoading={previousLoading}
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
                subscriptions={activeSubscriptions}
                currentIncome={currentIncome}
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
      </div>
    </div>
  );
}
