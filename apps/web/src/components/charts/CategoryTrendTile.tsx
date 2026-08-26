import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useTheme } from '../../contexts/ThemeContext';
import { CategoryTrendPoint } from '../../hooks/transactions/selectors/buildCategoryTrends';
import { formatMonth, formatMonthWithYear } from '../../utils/formatMonth';
import { ArrowDownIcon, ArrowUpIcon } from '../icons';
import { MoneyAmount } from '../ui';

export const SPARKLINE_HEIGHT = 90;

type TileTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload: CategoryTrendPoint }>;
};

function TileTooltip({ active, payload }: TileTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const { month, total } = payload[0].payload;

  return (
    <div className="bg-bg-surface ring-border rounded px-2.5 py-1.5 shadow-lg ring-1">
      <p className="text-text-secondary text-xs font-medium">
        {formatMonthWithYear(month)}
      </p>

      <p className="text-text-primary text-xs font-semibold">
        <MoneyAmount amount={total} />
      </p>
    </div>
  );
}

type CategoryTrendTileProps = {
  category: string;
  color: string;
  currentTotal: number;
  delta: number | null;
  maxTotal: number;
  points: Array<CategoryTrendPoint>;
  onSelect: () => void;
};

export function CategoryTrendTile({
  category,
  color,
  currentTotal,
  delta,
  maxTotal,
  onSelect,
  points,
}: CategoryTrendTileProps) {
  const { resolvedTheme } = useTheme();
  const tickColor = resolvedTheme === 'dark' ? '#9ca3af' : '#6b7280';
  const isIncrease = delta !== null && delta > 0;
  const deltaColor = isIncrease
    ? 'text-red-600 dark:text-red-400'
    : 'text-green-600 dark:text-green-400';

  return (
    <button
      type="button"
      onClick={onSelect}
      className="border-border hover:border-brand-500 bg-bg-surface flex w-full cursor-pointer flex-col rounded border p-4 text-left transition-colors"
    >
      <span className="text-text-secondary truncate text-sm font-medium">
        {category}
      </span>

      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-text-primary text-2xl font-semibold">
          <MoneyAmount amount={currentTotal} />
        </span>

        {delta === null || delta === 0 ? (
          <span className="text-text-tertiary text-sm font-medium">—</span>
        ) : (
          <span
            className={`flex items-center gap-0.5 text-sm font-medium ${deltaColor}`}
          >
            {isIncrease ? (
              <ArrowUpIcon className="h-4 w-4 shrink-0" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 shrink-0" />
            )}

            <MoneyAmount amount={Math.abs(delta)} />
          </span>
        )}
      </div>

      <div className="mt-3 w-full">
        <ResponsiveContainer width="100%" height={SPARKLINE_HEIGHT}>
          <LineChart
            data={points}
            margin={{ top: 6, right: 8, bottom: 0, left: 8 }}
          >
            <YAxis hide domain={[0, maxTotal || 1]} />

            <XAxis
              dataKey="month"
              tickFormatter={formatMonth}
              tick={{ fontSize: 11, fill: tickColor }}
              interval="preserveStartEnd"
              axisLine={false}
              tickLine={false}
            />

            <Tooltip content={<TileTooltip />} cursor={false} />

            <Line
              type="monotone"
              dataKey="total"
              stroke={color}
              strokeWidth={2}
              dot={{ r: 2, fill: color }}
              activeDot={{ r: 4, fill: color }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </button>
  );
}
