import { ErrorBoundary } from '../components/ErrorBoundary';
import { ContractsExpiringSoonCard } from '../components/home/ContractsExpiringSoonCard';
import { IncomeExpensesSection } from '../components/home/IncomeExpensesSection';
import { MonthlyInsightsGrid } from '../components/home/MonthlyInsightsGrid';
import { NetWorthSummaryCard } from '../components/home/NetWorthSummaryCard';
import { ReportSummaryGrid } from '../components/home/ReportSummaryGrid';
import { SubscriptionsSection } from '../components/home/SubscriptionsSection';
import { GettingStartedCard } from '../components/onboarding/GettingStartedCard';
import { WelcomeModal } from '../components/onboarding/WelcomeModal';
import { Divider, PageLayout } from '../components/ui';
import { useHomeData } from '../hooks/home/useHomeData';
import { useOnboardingData } from '../hooks/onboarding/useOnboardingData';

export function Home() {
  const {
    activeSubscriptions,
    chartReports,
    contractsLoading,
    currentIncome,
    currentLoading,
    currentReport,
    expiringContracts,
    hasContracts,
    insightsLoading,
    lastSnapshot,
    netWorthLoading,
    previousLoading,
    previousReport,
    previousSnapshot,
    recentSnapshots,
    reportsLoading,
    savingsRate,
    savingsRateReportTitle,
    spendingInsight,
    spendingInsightBaselineMonths,
    spendingInsightMonth,
    subscriptionsLoading,
    summaryLoading,
    totalReportsCount,
  } = useHomeData();

  const {
    completedCount,
    initialCurrency,
    initialFullName,
    isChecklistVisible,
    isSavingWelcome,
    isWelcomeOpen,
    onCloseWelcome,
    onDismiss,
    onSaveWelcome,
    steps,
    totalCount,
  } = useOnboardingData();

  return (
    <>
      <PageLayout className="space-y-10">
        {isChecklistVisible && (
          <section>
            <GettingStartedCard
              completedCount={completedCount}
              steps={steps}
              totalCount={totalCount}
              onDismiss={onDismiss}
            />
          </section>
        )}

        <section>
          <ReportSummaryGrid
            currentLoading={currentLoading}
            currentReport={currentReport}
            previousLoading={previousLoading}
            previousReport={previousReport}
            reportsLoading={reportsLoading}
            totalCount={totalReportsCount}
          />

          <MonthlyInsightsGrid
            baselineMonths={spendingInsightBaselineMonths}
            insight={spendingInsight}
            insightMonth={spendingInsightMonth}
            loading={insightsLoading}
            savingsRate={savingsRate}
            savingsRateReportTitle={savingsRateReportTitle}
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
          <ContractsExpiringSoonCard
            contracts={expiringContracts}
            hasContracts={hasContracts}
            loading={contractsLoading}
          />
        </section>

        <Divider />

        <section>
          <NetWorthSummaryCard
            loading={netWorthLoading}
            previousSnapshot={previousSnapshot}
            recentSnapshots={recentSnapshots}
            snapshot={lastSnapshot}
          />
        </section>
      </PageLayout>

      <WelcomeModal
        initialCurrency={initialCurrency}
        initialFullName={initialFullName}
        isOpen={isWelcomeOpen}
        isSaving={isSavingWelcome}
        onClose={onCloseWelcome}
        onSubmit={onSaveWelcome}
      />
    </>
  );
}
