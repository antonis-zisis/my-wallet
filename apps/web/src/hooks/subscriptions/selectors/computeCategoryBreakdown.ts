import { Subscription } from '../../../types/subscription';
import { isActiveTrial } from '../../../utils/isActiveTrial';

export type CategoryBreakdownSlice = {
  category: string;
  total: number;
};

export const UNCATEGORIZED_LABEL = 'Uncategorized';

export function computeCategoryBreakdown(
  subscriptions: Array<Subscription>
): Array<CategoryBreakdownSlice> {
  const totalsByCategory = new Map<string, number>();

  for (const subscription of subscriptions) {
    if (subscription.cancelledAt || isActiveTrial(subscription)) {
      continue;
    }

    const category = subscription.category ?? UNCATEGORIZED_LABEL;
    totalsByCategory.set(
      category,
      (totalsByCategory.get(category) ?? 0) + subscription.monthlyCost
    );
  }

  return Array.from(totalsByCategory.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((left, right) => right.total - left.total);
}
