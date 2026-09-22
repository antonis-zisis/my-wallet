import { SpendingInsight } from '../../hooks/transactions/selectors/buildSpendingInsights';
import { formatMonthWithYear } from '../../utils/formatMonth';
import { ArrowDownIcon, ArrowUpIcon, TrendingChartIcon } from '../icons';
import { MoneyAmount } from '../ui';

function toPercentLabel(percentageChange: number): string {
  const percent = Math.round(Math.abs(percentageChange) * 100);

  return `${percent}% ${percentageChange >= 0 ? 'above' : 'below'}`;
}

type SpendingInsightRowProps = {
  baselineMonths: number;
  insight: SpendingInsight;
};

function SpendingInsightRow({
  baselineMonths,
  insight,
}: SpendingInsightRowProps) {
  const isIncrease = insight.direction === 'INCREASE';

  return (
    <li className="flex flex-col gap-0.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-text-primary truncate text-sm font-medium">
          {insight.category}
        </span>

        <span
          className={`flex shrink-0 items-center gap-0.5 text-sm font-semibold ${
            isIncrease
              ? 'text-red-600 dark:text-red-400'
              : 'text-green-600 dark:text-green-400'
          }`}
        >
          {isIncrease ? (
            <ArrowUpIcon className="size-4 shrink-0" />
          ) : (
            <ArrowDownIcon className="size-4 shrink-0" />
          )}

          <MoneyAmount amount={Math.abs(insight.difference)} />
        </span>
      </div>

      <p className="text-text-secondary text-xs">
        <MoneyAmount amount={insight.total} />

        {insight.percentageChange === null ? (
          <> · nothing spent here in the previous {baselineMonths} months</>
        ) : (
          <>
            {' · '}
            {toPercentLabel(insight.percentageChange)} your average of{' '}
            <MoneyAmount amount={insight.baselineAverage} />
          </>
        )}
      </p>
    </li>
  );
}

type SpendingInsightsProps = {
  baselineMonths: number;
  insights: Array<SpendingInsight>;
  month: string;
};

export function SpendingInsights({
  baselineMonths,
  insights,
  month,
}: SpendingInsightsProps) {
  return (
    <section className="border-border bg-bg-surface mb-6 rounded border p-4">
      <div className="flex items-start gap-2">
        <TrendingChartIcon className="text-brand-600 dark:text-brand-400 mt-0.5 size-5 shrink-0" />

        <div className="min-w-0">
          <h2 className="text-text-primary text-sm font-semibold">
            Biggest changes in {formatMonthWithYear(month)}
          </h2>

          <p className="text-text-tertiary text-xs">
            Against your previous {baselineMonths} months
          </p>
        </div>
      </div>

      <ul className="mt-4 flex flex-col gap-3">
        {insights.map((insight) => (
          <SpendingInsightRow
            key={insight.category}
            baselineMonths={baselineMonths}
            insight={insight}
          />
        ))}
      </ul>
    </section>
  );
}
