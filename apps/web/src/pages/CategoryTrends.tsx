import { Link } from 'react-router';

import { CircleAlertIcon, DocumentTextIcon } from '../components/icons';
import { ReportBackLink } from '../components/reports/ReportBackLink';
import { CategoryTrendDetail } from '../components/transactions/CategoryTrendDetail';
import { CategoryTrendsGrid } from '../components/transactions/CategoryTrendsGrid';
import { CategoryTrendsWindowPicker } from '../components/transactions/CategoryTrendsWindowPicker';
import { PageLayout, Skeleton } from '../components/ui';
import { useCategoryTrendsData } from '../hooks/transactions/useCategoryTrendsData';
import { formatMonth } from '../utils/formatMonth';

const SKELETON_TILE_COUNT = 8;

function TrendsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {Array.from({ length: SKELETON_TILE_COUNT }, (_, index) => (
        <Skeleton key={index} className="h-52 w-full" />
      ))}
    </div>
  );
}

function ErrorState() {
  return (
    <div className="border-border flex flex-col items-center justify-center gap-3 rounded border-2 border-dashed py-10 text-center">
      <CircleAlertIcon className="text-border-strong size-10" />

      <p className="text-text-secondary text-sm font-medium">
        Could not load category trends
      </p>

      <p className="text-text-tertiary text-xs">Please try again later.</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border-border flex flex-col items-center justify-center gap-3 rounded border-2 border-dashed py-10 text-center">
      <DocumentTextIcon className="text-border-strong size-10" />

      <p className="text-text-secondary text-sm font-medium">
        Not enough history yet
      </p>

      <p className="text-text-tertiary text-xs">
        Add expenses across at least two months to see how each category
        changes.
      </p>

      <Link
        to="/reports"
        className="text-brand-600 dark:text-brand-400 text-sm font-semibold hover:underline"
      >
        Go to reports
      </Link>
    </div>
  );
}

export function CategoryTrends() {
  const {
    currentMonth,
    error,
    hasEnoughHistory,
    loading,
    onClearCategory,
    onSelectCategory,
    onWindowChange,
    previousMonth,
    selectedTrend,
    trends,
    windowMonths,
  } = useCategoryTrendsData();

  const scope =
    currentMonth && previousMonth
      ? `Across all reports · ${formatMonth(currentMonth)} so far vs ${formatMonth(previousMonth)}`
      : 'Across all reports';

  return (
    <PageLayout>
      <ReportBackLink />

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-text-primary text-2xl font-bold">
            Category Trends
          </h1>

          <p className="text-text-secondary mt-1 text-sm">{scope}</p>
        </div>

        {!loading && !error && hasEnoughHistory && (
          <CategoryTrendsWindowPicker
            value={windowMonths}
            onChange={onWindowChange}
          />
        )}
      </div>

      {loading && <TrendsSkeleton />}

      {!loading && error && <ErrorState />}

      {!loading && !error && !hasEnoughHistory && <EmptyState />}

      {!loading && !error && hasEnoughHistory && selectedTrend && (
        <CategoryTrendDetail trend={selectedTrend} onBack={onClearCategory} />
      )}

      {!loading && !error && hasEnoughHistory && !selectedTrend && (
        <>
          {trends.length === 0 ? (
            <p className="text-text-tertiary py-10 text-center text-sm">
              No expenses in the selected period.
            </p>
          ) : (
            <CategoryTrendsGrid
              trends={trends}
              onSelectCategory={onSelectCategory}
            />
          )}
        </>
      )}
    </PageLayout>
  );
}
