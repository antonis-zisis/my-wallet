import { CategoryTrend } from '../../hooks/transactions/selectors/buildCategoryTrends';
import {
  CategoryTrendTile,
  EXPENSE_CATEGORY_COLORS,
  FALLBACK_CATEGORY_COLOR,
} from '../charts';

type CategoryTrendsGridProps = {
  trends: Array<CategoryTrend>;
  onSelectCategory: (category: string) => void;
};

export function CategoryTrendsGrid({
  onSelectCategory,
  trends,
}: CategoryTrendsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {trends.map((trend) => (
        <CategoryTrendTile
          key={trend.category}
          category={trend.category}
          color={
            EXPENSE_CATEGORY_COLORS[trend.category] ?? FALLBACK_CATEGORY_COLOR
          }
          currentTotal={trend.currentTotal}
          delta={trend.delta}
          maxTotal={trend.maxTotal}
          points={trend.points}
          onSelect={() => onSelectCategory(trend.category)}
        />
      ))}
    </div>
  );
}
