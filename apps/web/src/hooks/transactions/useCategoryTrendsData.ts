import { useQuery } from '@apollo/client/react';
import { useMemo, useState } from 'react';

import { GET_EXPENSE_CATEGORY_TOTALS_BY_MONTH } from '../../graphql/transactions';
import { ExpenseCategoryTotalsData } from '../../types/transaction';
import { useLocalStorage } from '../useLocalStorage';
import { buildCategoryTrends } from './selectors/buildCategoryTrends';

export const WINDOW_OPTIONS = [3, 6, 9, 12] as const;

export type WindowOption = (typeof WINDOW_OPTIONS)[number];

const MAX_WINDOW_MONTHS = 12;

export function useCategoryTrendsData() {
  const [windowMonths, setWindowMonths] = useLocalStorage<WindowOption>(
    'reports.categoryTrends.windowMonths',
    MAX_WINDOW_MONTHS
  );

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data, error, loading } = useQuery<ExpenseCategoryTotalsData>(
    GET_EXPENSE_CATEGORY_TOTALS_BY_MONTH,
    { variables: { months: MAX_WINDOW_MONTHS } }
  );

  const totals = useMemo(
    () => data?.expenseCategoryTotalsByMonth ?? [],
    [data]
  );

  const { hasEnoughHistory, months, previousMonth, trends } = useMemo(
    () => buildCategoryTrends({ now: new Date(), totals, windowMonths }),
    [totals, windowMonths]
  );

  return {
    currentMonth: months[months.length - 1] ?? null,
    error: !!error,
    hasEnoughHistory,
    loading,
    onClearCategory: () => setSelectedCategory(null),
    onSelectCategory: setSelectedCategory,
    onWindowChange: setWindowMonths,
    previousMonth,
    selectedTrend:
      trends.find((trend) => trend.category === selectedCategory) ?? null,
    trends,
    windowMonths,
  };
}
