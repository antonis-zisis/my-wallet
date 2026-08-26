import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { usePrivacy } from '../../contexts/PrivacyContext';
import { useTheme } from '../../contexts/ThemeContext';
import { CategoryTrendPoint } from '../../hooks/transactions/selectors/buildCategoryTrends';
import { formatMoneyOrMask } from '../../utils/formatMoney';
import { formatMonthWithYear } from '../../utils/formatMonth';
import { MoneyAmount } from '../ui';

type ChartTooltipProps = {
  active?: boolean;
  label?: string;
  payload?: Array<{ value: number }>;
};

function ChartTooltip({ active, label, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="bg-bg-surface ring-border rounded px-3 py-2 shadow-lg ring-1">
      <p className="text-text-secondary text-xs font-medium">{label}</p>

      <p className="text-text-primary text-xs font-semibold">
        <MoneyAmount amount={payload[0].value} />
      </p>
    </div>
  );
}

type CategoryTrendChartProps = {
  color: string;
  points: Array<CategoryTrendPoint>;
};

export function CategoryTrendChart({ color, points }: CategoryTrendChartProps) {
  const { resolvedTheme } = useTheme();
  const { isAmountsHidden } = usePrivacy();
  const tickColor = resolvedTheme === 'dark' ? '#d1d5db' : '#374151';
  const gridColor = resolvedTheme === 'dark' ? '#374151' : '#e5e7eb';

  const chartData = points.map((point) => ({
    name: formatMonthWithYear(point.month),
    total: point.total,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={chartData}
        margin={{ top: 8, right: 16, bottom: 8, left: 16 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={gridColor}
          vertical={false}
        />

        <XAxis dataKey="name" tick={{ fontSize: 12, fill: tickColor }} />

        <YAxis
          tickFormatter={(value: number) =>
            `${formatMoneyOrMask(value, isAmountsHidden)}€`
          }
          tick={{ fontSize: 12, fill: tickColor }}
          width={64}
        />

        <Tooltip content={<ChartTooltip />} cursor={false} />

        <Bar dataKey="total" fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
