import { Link } from 'react-router-dom';

import { ErrorBoundary } from '../components/ErrorBoundary';
import {
  IncomeExpensesSection,
  NetWorthSummaryCard,
  ReportSummaryGrid,
  SubscriptionSummarySection,
  UpcomingRenewalsCard,
} from '../components/home';
import { Card, Divider, PageLayout, Skeleton } from '../components/ui';
import { useHomeData } from '../hooks/useHomeData';

function SubscriptionsSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {[0, 1, 2].map((index) => (
        <Card key={index}>
          <Skeleton className="mb-3 h-3 w-1/2" />
          <Skeleton className="h-7 w-2/5" />
        </Card>
      ))}
    </div>
  );
}

function SubscriptionsCTACard() {
  return (
    <Card>
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-200 py-10 text-center dark:border-gray-700">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          No subscriptions tracked yet
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Add your recurring bills to track monthly costs and upcoming renewals.
        </p>
        <Link
          to="/subscriptions"
          className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
        >
          Add a subscription
        </Link>
      </div>
    </Card>
  );
}

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
        {subscriptionsLoading ? (
          <SubscriptionsSkeletonGrid />
        ) : activeSubscriptions.length === 0 ? (
          <SubscriptionsCTACard />
        ) : (
          <>
            <SubscriptionSummarySection
              currentIncome={currentIncome}
              subscriptions={activeSubscriptions}
            />
            <UpcomingRenewalsCard subscriptions={activeSubscriptions} />
          </>
        )}
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
