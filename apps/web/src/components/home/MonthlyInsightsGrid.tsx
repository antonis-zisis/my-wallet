import { SpendingInsight } from '../../hooks/transactions/selectors/buildSpendingInsights';
import { Card, Skeleton } from '../ui';
import { SavingsRateCard } from './SavingsRateCard';
import { SpendingInsightCard } from './SpendingInsightCard';

function SkeletonGrid() {
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
      <Card className="md:col-span-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="mt-2 h-3 w-36" />
        <Skeleton className="mt-3 h-5 w-64" />
      </Card>

      <Card>
        <Skeleton className="h-4 w-16" />
        <Skeleton className="mt-2 h-7 w-20" />
        <Skeleton className="mt-2 h-3 w-28" />
      </Card>
    </div>
  );
}

type MonthlyInsightsGridProps = {
  baselineMonths: number;
  insight: SpendingInsight | null;
  insightMonth: string | null;
  loading: boolean;
  savingsRate: number | null;
  savingsRateReportTitle: string | null;
};

export function MonthlyInsightsGrid({
  baselineMonths,
  insight,
  insightMonth,
  loading,
  savingsRate,
  savingsRateReportTitle,
}: MonthlyInsightsGridProps) {
  if (loading) {
    return <SkeletonGrid />;
  }

  const hasInsight = insight !== null && insightMonth !== null;
  const hasSavingsRate =
    savingsRate !== null && savingsRateReportTitle !== null;

  if (!hasInsight && !hasSavingsRate) {
    return null;
  }

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
      {insight !== null && insightMonth !== null && (
        <SpendingInsightCard
          baselineMonths={baselineMonths}
          className={hasSavingsRate ? 'md:col-span-3' : 'md:col-span-4'}
          insight={insight}
          month={insightMonth}
        />
      )}

      {savingsRate !== null && savingsRateReportTitle !== null && (
        <SavingsRateCard
          className={hasInsight ? '' : 'md:col-span-4'}
          rate={savingsRate}
          reportTitle={savingsRateReportTitle}
        />
      )}
    </div>
  );
}
