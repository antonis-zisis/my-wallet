import { useMemo } from 'react';

import { type CategoryBreakdownSlice } from '../../hooks/subscriptions/selectors/computeCategoryBreakdown';
import { MoneyAmount, Skeleton } from '../ui';
import {
  FALLBACK_CATEGORY_COLOR,
  SUBSCRIPTION_CATEGORY_COLORS,
} from './categoryColors';

const SKELETON_LEGEND_WIDTHS = ['w-20', 'w-24', 'w-16', 'w-24', 'w-20'];

type SubscriptionCategoryBreakdownChartProps = {
  breakdown: Array<CategoryBreakdownSlice>;
  loading?: boolean;
};

export function SubscriptionCategoryBreakdownChart({
  breakdown,
  loading,
}: SubscriptionCategoryBreakdownChartProps) {
  const chartData = useMemo(() => {
    const total = breakdown.reduce((sum, slice) => sum + slice.total, 0);

    return breakdown.map((slice) => ({
      fill:
        SUBSCRIPTION_CATEGORY_COLORS[slice.category] ?? FALLBACK_CATEGORY_COLOR,
      name: slice.category,
      percentage: total > 0 ? (slice.total / total) * 100 : 0,
      value: slice.total,
    }));
  }, [breakdown]);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-2.5 w-full rounded-full" />

        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {SKELETON_LEGEND_WIDTHS.map((width, index) => (
            <Skeleton key={index} className={`h-4 ${width}`} />
          ))}
        </div>
      </div>
    );
  }

  if (chartData.length < 1) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex h-2.5 w-full overflow-hidden rounded-full">
        {chartData.map((item) => (
          <div
            key={item.name}
            style={{ backgroundColor: item.fill, width: `${item.percentage}%` }}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: item.fill }}
            />
            <span className="text-text-secondary text-xs">{item.name}</span>
            <MoneyAmount
              amount={item.value}
              className="text-text-primary text-xs font-medium"
            />
            <span className="text-text-tertiary text-xs">
              ({item.percentage.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
