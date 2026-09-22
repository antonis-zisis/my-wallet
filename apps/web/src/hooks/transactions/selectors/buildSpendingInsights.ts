import { CategoryMonthlyTotal } from '../../../types/transaction';
import { toMonthKey } from '../../../utils/toMonthKey';

type BuildSpendingInsightsInput = {
  now: Date;
  totals: Array<CategoryMonthlyTotal>;
};

export type SpendingInsightDirection = 'INCREASE' | 'DECREASE';

export type SpendingInsight = {
  baselineAverage: number;
  category: string;
  difference: number;
  direction: SpendingInsightDirection;
  percentageChange: number | null;
  total: number;
};

export type SpendingInsightsView = {
  baselineMonthCount: number;
  insights: Array<SpendingInsight>;
  month: string | null;
};

const BASELINE_MONTHS = 6;
const MIN_BASELINE_MONTHS = 3;
const MIN_PERCENTAGE_CHANGE = 0.4;
const MIN_SHARE_OF_TYPICAL_MONTH = 0.02;
const MIN_MONTH_ACTIVITY_RATIO = 0.25;
const MAX_INSIGHTS = 3;

function emptyInsights(
  month: string | null,
  baselineMonthCount: number
): SpendingInsightsView {
  return { baselineMonthCount, insights: [], month };
}

function buildCandidateMonths(now: Date): Array<string> {
  const months: Array<string> = [];

  for (let offset = BASELINE_MONTHS; offset >= 1; offset -= 1) {
    months.push(
      toMonthKey(now.getUTCFullYear(), now.getUTCMonth() - 1 - offset)
    );
  }

  return months;
}

type ToInsightInput = {
  baselineMonths: Array<string>;
  category: string;
  month: string;
  totalByCategoryMonth: Map<string, number>;
};

function toInsight({
  baselineMonths,
  category,
  month,
  totalByCategoryMonth,
}: ToInsightInput): SpendingInsight {
  const total = totalByCategoryMonth.get(`${category}|${month}`) ?? 0;

  const baselineAverage =
    baselineMonths.reduce(
      (sum, baselineMonth) =>
        sum + (totalByCategoryMonth.get(`${category}|${baselineMonth}`) ?? 0),
      0
    ) / baselineMonths.length;

  const difference = total - baselineAverage;

  return {
    baselineAverage,
    category,
    difference,
    direction: difference >= 0 ? 'INCREASE' : 'DECREASE',
    percentageChange:
      baselineAverage === 0 ? null : difference / baselineAverage,
    total,
  };
}

function isSignificant(insight: SpendingInsight, floor: number): boolean {
  if (Math.abs(insight.difference) < floor) {
    return false;
  }

  return (
    insight.percentageChange === null ||
    Math.abs(insight.percentageChange) >= MIN_PERCENTAGE_CHANGE
  );
}

export function buildSpendingInsights({
  now,
  totals,
}: BuildSpendingInsightsInput): SpendingInsightsView {
  const month = toMonthKey(now.getUTCFullYear(), now.getUTCMonth() - 1);
  const candidateMonths = buildCandidateMonths(now);
  const relevantMonths = new Set([month, ...candidateMonths]);

  const totalByCategoryMonth = new Map<string, number>();
  const totalByMonth = new Map<string, number>();
  const categories = new Set<string>();

  for (const entry of totals) {
    if (!relevantMonths.has(entry.month)) {
      continue;
    }

    const key = `${entry.category}|${entry.month}`;

    totalByCategoryMonth.set(
      key,
      (totalByCategoryMonth.get(key) ?? 0) + entry.total
    );
    totalByMonth.set(
      entry.month,
      (totalByMonth.get(entry.month) ?? 0) + entry.total
    );
    categories.add(entry.category);
  }

  const baselineMonths = candidateMonths.filter(
    (candidate) => (totalByMonth.get(candidate) ?? 0) > 0
  );

  if (baselineMonths.length < MIN_BASELINE_MONTHS) {
    return emptyInsights(null, baselineMonths.length);
  }

  const monthTotal = totalByMonth.get(month) ?? 0;

  const baselineMonthlyAverage =
    baselineMonths.reduce(
      (sum, baselineMonth) => sum + (totalByMonth.get(baselineMonth) ?? 0),
      0
    ) / baselineMonths.length;

  const looksUnlogged =
    monthTotal <= 0 ||
    monthTotal < baselineMonthlyAverage * MIN_MONTH_ACTIVITY_RATIO;

  if (looksUnlogged) {
    return emptyInsights(month, baselineMonths.length);
  }

  const significanceFloor =
    Math.max(monthTotal, baselineMonthlyAverage) * MIN_SHARE_OF_TYPICAL_MONTH;

  const insights = [...categories]
    .map((category) =>
      toInsight({ baselineMonths, category, month, totalByCategoryMonth })
    )
    .filter((insight) => isSignificant(insight, significanceFloor))
    .sort(
      (left, right) => Math.abs(right.difference) - Math.abs(left.difference)
    )
    .slice(0, MAX_INSIGHTS);

  return { baselineMonthCount: baselineMonths.length, insights, month };
}
