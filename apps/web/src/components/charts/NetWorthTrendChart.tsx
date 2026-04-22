import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useTheme } from '../../contexts/ThemeContext';
import { NetWorthSnapshot } from '../../types/netWorth';
import { abbreviateReportTitle } from '../../utils/abbreviateReportTitle';
import { formatDate } from '../../utils/formatDate';
import { formatMoney } from '../../utils/formatMoney';

type TrendSnapshot = Pick<
  NetWorthSnapshot,
  'id' | 'title' | 'netWorth' | 'createdAt'
>;

interface NetWorthTrendChartProps {
  snapshots: Array<TrendSnapshot>;
}

interface TooltipPayloadEntry {
  payload: {
    createdAt: string;
    id: string;
    netWorth: number;
    title: string;
  };
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<TooltipPayloadEntry>;
}

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const { createdAt, netWorth, title } = payload[0].payload;
  const sign = netWorth < 0 ? '-' : '';

  return (
    <div className="rounded bg-white px-3 py-2 shadow-lg ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
      <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">
        {title}
      </p>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        {formatDate(createdAt)}
      </p>

      <p className="mt-1 text-xs font-semibold text-gray-800 dark:text-gray-100">
        {sign}
        {formatMoney(Math.abs(netWorth))} €
      </p>
    </div>
  );
}

export function NetWorthTrendChart({ snapshots }: NetWorthTrendChartProps) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const tickColor = theme === 'dark' ? '#d1d5db' : '#374151';
  const gridColor = theme === 'dark' ? '#374151' : '#e5e7eb';

  const chartData = useMemo(() => {
    return [...snapshots]
      .sort((first, second) => {
        const firstValue = /^\d+$/.test(first.createdAt)
          ? Number(first.createdAt)
          : new Date(first.createdAt).getTime();
        const secondValue = /^\d+$/.test(second.createdAt)
          ? Number(second.createdAt)
          : new Date(second.createdAt).getTime();
        return firstValue - secondValue;
      })
      .map((snapshot) => ({
        id: snapshot.id,
        name: abbreviateReportTitle(snapshot.title),
        netWorth: snapshot.netWorth,
        title: snapshot.title,
        createdAt: snapshot.createdAt,
      }));
  }, [snapshots]);

  if (chartData.length < 2) {
    return null;
  }

  const latest = chartData[chartData.length - 1];
  const strokeColor = latest.netWorth >= 0 ? '#10b981' : '#ef4444';

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart
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
          tickFormatter={(value: number) => `${formatMoney(value)}€`}
          tick={{ fontSize: 12, fill: tickColor }}
          width={80}
        />

        <Tooltip content={<ChartTooltip />} />

        <Line
          type="monotone"
          dataKey="netWorth"
          stroke={strokeColor}
          strokeWidth={2}
          dot={{ fill: strokeColor, cursor: 'pointer' }}
          activeDot={{
            cursor: 'pointer',
            onClick: (_event, data) => {
              const payload = (data as { payload?: { id: string } }).payload;
              if (payload?.id) {
                navigate(`/net-worth/${payload.id}`);
              }
            },
          }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
