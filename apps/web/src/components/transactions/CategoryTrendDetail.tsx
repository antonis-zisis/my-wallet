import { CategoryTrend } from '../../hooks/transactions/selectors/buildCategoryTrends';
import {
  CategoryTrendChart,
  EXPENSE_CATEGORY_COLORS,
  FALLBACK_CATEGORY_COLOR,
} from '../charts';
import { ArrowDownIcon, ArrowUpIcon, ChevronLeftIcon } from '../icons';
import { Card, MoneyAmount } from '../ui';

type CategoryTrendDetailProps = {
  trend: CategoryTrend;
  onBack: () => void;
};

function DeltaBadge({ delta }: { delta: number | null }) {
  if (delta === null || delta === 0) {
    return <span className="text-text-tertiary text-sm font-medium">—</span>;
  }

  const isIncrease = delta > 0;

  return (
    <span
      className={`flex items-center gap-0.5 text-sm font-medium ${
        isIncrease
          ? 'text-red-600 dark:text-red-400'
          : 'text-green-600 dark:text-green-400'
      }`}
    >
      {isIncrease ? (
        <ArrowUpIcon className="h-4 w-4 shrink-0" />
      ) : (
        <ArrowDownIcon className="h-4 w-4 shrink-0" />
      )}

      <MoneyAmount amount={Math.abs(delta)} />
    </span>
  );
}

export function CategoryTrendDetail({
  onBack,
  trend,
}: CategoryTrendDetailProps) {
  return (
    <Card>
      <button
        type="button"
        onClick={onBack}
        className="text-text-secondary hover:text-text-primary flex cursor-pointer items-center gap-1 text-sm font-medium"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        All categories
      </button>

      <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-text-primary text-lg font-semibold">
          {trend.category}
        </h2>

        <span className="text-text-primary text-2xl font-semibold">
          <MoneyAmount amount={trend.currentTotal} />
        </span>

        <DeltaBadge delta={trend.delta} />
      </div>

      <div className="mt-4">
        <CategoryTrendChart
          color={
            EXPENSE_CATEGORY_COLORS[trend.category] ?? FALLBACK_CATEGORY_COLOR
          }
          points={trend.points}
        />
      </div>
    </Card>
  );
}
