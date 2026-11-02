import { type CategoryBreakdownSlice } from '../../hooks/subscriptions/selectors/computeCategoryBreakdown';
import { CategoryBreakdownBar } from './CategoryBreakdownBar';
import { SUBSCRIPTION_CATEGORY_COLORS } from './categoryColors';

type SubscriptionCategoryBreakdownChartProps = {
  breakdown: Array<CategoryBreakdownSlice>;
  loading?: boolean;
};

export function SubscriptionCategoryBreakdownChart({
  breakdown,
  loading,
}: SubscriptionCategoryBreakdownChartProps) {
  return (
    <CategoryBreakdownBar
      breakdown={breakdown}
      colors={SUBSCRIPTION_CATEGORY_COLORS}
      loading={loading}
    />
  );
}
