import {
  CategoryMonthlyTotal,
  EXPENSE_CATEGORIES,
} from '../../../types/transaction';

type BuildCategoryTrendsInput = {
  now: Date;
  totals: Array<CategoryMonthlyTotal>;
  windowMonths: number;
};

export type CategoryTrendPoint = {
  month: string;
  total: number;
};

export type CategoryTrend = {
  category: string;
  currentTotal: number;
  delta: number | null;
  maxTotal: number;
  points: Array<CategoryTrendPoint>;
};

export type CategoryTrendsView = {
  hasEnoughHistory: boolean;
  months: Array<string>;
  previousMonth: string | null;
  trends: Array<CategoryTrend>;
};

function toMonthKey(year: number, monthIndex: number): string {
  const date = new Date(Date.UTC(year, monthIndex, 1));
  const month = `${date.getUTCMonth() + 1}`.padStart(2, '0');

  return `${date.getUTCFullYear()}-${month}`;
}

function buildMonthAxis(
  now: Date,
  windowMonths: number,
  earliestMonth: string | null
): Array<string> {
  const months: Array<string> = [];

  for (let offset = windowMonths - 1; offset >= 0; offset -= 1) {
    months.push(toMonthKey(now.getUTCFullYear(), now.getUTCMonth() - offset));
  }

  if (earliestMonth === null) {
    return months;
  }

  const clamped = months.filter((month) => month >= earliestMonth);

  return clamped.length > 0 ? clamped : months;
}

function categoryRank(category: string): number {
  const index = EXPENSE_CATEGORIES.indexOf(category as never);

  return index === -1 ? EXPENSE_CATEGORIES.length : index;
}

function compareTrends(left: CategoryTrend, right: CategoryTrend) {
  const rankDifference =
    categoryRank(left.category) - categoryRank(right.category);

  if (rankDifference !== 0) {
    return rankDifference;
  }

  return left.category.localeCompare(right.category);
}

function toTrend(
  category: string,
  series: Array<number>,
  months: Array<string>
): CategoryTrend {
  const currentTotal = series[series.length - 1] ?? 0;
  const previousTotal = series.length >= 2 ? series[series.length - 2] : null;

  return {
    category,
    currentTotal,
    delta: previousTotal === null ? null : currentTotal - previousTotal,
    maxTotal: Math.max(...series),
    points: months.map((month, index) => ({ month, total: series[index] })),
  };
}

export function buildCategoryTrends({
  now,
  totals,
  windowMonths,
}: BuildCategoryTrendsInput): CategoryTrendsView {
  const earliestMonth = totals.reduce<string | null>(
    (earliest, total) =>
      earliest === null || total.month < earliest ? total.month : earliest,
    null
  );

  const months = buildMonthAxis(now, windowMonths, earliestMonth);
  const monthIndexes = new Map(months.map((month, index) => [month, index]));
  const seriesByCategory = new Map<string, Array<number>>();

  for (const total of totals) {
    const index = monthIndexes.get(total.month);

    if (index === undefined) {
      continue;
    }

    const series = seriesByCategory.get(total.category) ?? months.map(() => 0);

    series[index] += total.total;
    seriesByCategory.set(total.category, series);
  }

  const trends = [...seriesByCategory.entries()]
    .map(([category, series]) => toTrend(category, series, months))
    .sort(compareTrends);

  return {
    hasEnoughHistory: new Set(totals.map((total) => total.month)).size >= 2,
    months,
    previousMonth: months.length >= 2 ? months[months.length - 2] : null,
    trends,
  };
}
