import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useTheme } from '../../contexts/ThemeContext';
import { AdminSignupBucket } from '../../types/admin';

type SignupsChartProps = {
  buckets: Array<AdminSignupBucket>;
};

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
    <div className="bg-bg-surface ring-border rounded px-4 py-3 shadow-lg ring-1">
      <p className="text-text-secondary mb-1 text-xs font-semibold">
        Week of {label}
      </p>
      <p className="text-text-primary text-xs">
        {payload[0].value} {payload[0].value === 1 ? 'signup' : 'signups'}
      </p>
    </div>
  );
}

export function SignupsChart({ buckets }: SignupsChartProps) {
  const { resolvedTheme } = useTheme();
  const tickColor = resolvedTheme === 'dark' ? '#d1d5db' : '#374151';
  const gridColor = resolvedTheme === 'dark' ? '#374151' : '#e5e7eb';

  const chartData = buckets.map((bucket) => ({
    count: bucket.count,
    name: new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
    }).format(new Date(bucket.week)),
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={chartData}
        margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={gridColor}
          vertical={false}
        />

        <XAxis dataKey="name" tick={{ fontSize: 12, fill: tickColor }} />

        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12, fill: tickColor }}
          width={32}
        />

        <Tooltip content={<ChartTooltip />} cursor={false} />

        <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
