import { Link } from 'react-router';

import { SpendingInsight } from '../../hooks/transactions/selectors/buildSpendingInsights';
import { formatMonthWithYear } from '../../utils/formatMonth';
import { ArrowDownIcon, ArrowUpIcon } from '../icons';
import { Card, MoneyAmount } from '../ui';

type SpendingInsightCardProps = {
  baselineMonths: number;
  className?: string;
  insight: SpendingInsight;
  month: string;
};

export function SpendingInsightCard({
  baselineMonths,
  className = '',
  insight,
  month,
}: SpendingInsightCardProps) {
  const isIncrease = insight.direction === 'INCREASE';

  return (
    <Card className={className}>
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h2 className="text-text-primary text-sm font-semibold">
            Biggest change in {formatMonthWithYear(month)}
          </h2>

          <p className="text-text-tertiary text-xs">
            Against your previous {baselineMonths} months
          </p>
        </div>

        <Link
          to="/reports/trends"
          className="text-brand-600 dark:text-brand-400 text-sm font-medium hover:underline"
        >
          See all trends
        </Link>
      </div>

      <p className="text-text-secondary mt-3 flex flex-wrap items-center gap-1 text-sm">
        <span className="text-text-primary font-semibold">
          {insight.category}
        </span>

        <span
          className={`flex items-center gap-0.5 font-semibold ${
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

        {insight.percentageChange === null ? (
          <span>· nothing spent here before</span>
        ) : (
          <span>{isIncrease ? 'above' : 'below'} average</span>
        )}
      </p>
    </Card>
  );
}
