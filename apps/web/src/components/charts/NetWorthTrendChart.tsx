import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
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
  | 'id'
  | 'title'
  | 'netWorth'
  | 'totalAssets'
  | 'totalLiabilities'
  | 'snapshotDate'
>;

export type ChartView = 'netWorth' | 'breakdown';

interface NetWorthTrendChartProps {
  snapshots: Array<TrendSnapshot>;
  view: ChartView;
}

interface NetWorthTooltipPayloadEntry {
  payload: {
    snapshotDate: string;
    id: string;
    netWorth: number;
    title: string;
  };
}

interface NetWorthTooltipProps {
  active?: boolean;
  payload?: Array<NetWorthTooltipPayloadEntry>;
}

function NetWorthChartTooltip({ active, payload }: NetWorthTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const { netWorth, snapshotDate, title } = payload[0].payload;
  const sign = netWorth < 0 ? '-' : '';

  return (
    <div className="rounded bg-white px-3 py-2 shadow-lg ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
      <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">
        {title}
      </p>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        {formatDate(snapshotDate)}
      </p>

      <p className="mt-1 text-xs font-semibold text-gray-800 dark:text-gray-100">
        {sign}
        {formatMoney(Math.abs(netWorth))} €
      </p>
    </div>
  );
}

interface BreakdownTooltipPayloadEntry {
  payload: {
    snapshotDate: string;
    id: string;
    totalAssets: number;
    totalLiabilities: number;
    title: string;
  };
}

interface BreakdownTooltipProps {
  active?: boolean;
  payload?: Array<BreakdownTooltipPayloadEntry>;
}

function BreakdownChartTooltip({ active, payload }: BreakdownTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const { snapshotDate, title, totalAssets, totalLiabilities } =
    payload[0].payload;

  return (
    <div className="rounded bg-white px-3 py-2 shadow-lg ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
      <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">
        {title}
      </p>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        {formatDate(snapshotDate)}
      </p>

      <div className="mt-1 space-y-0.5">
        <p className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          Assets:{' '}
          <span className="font-semibold">{formatMoney(totalAssets)} €</span>
        </p>

        <p className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
          <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
          Liabilities:{' '}
          <span className="font-semibold">
            {formatMoney(totalLiabilities)} €
          </span>
        </p>
      </div>
    </div>
  );
}

export function NetWorthTrendChart({
  snapshots,
  view,
}: NetWorthTrendChartProps) {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const tickColor = resolvedTheme === 'dark' ? '#d1d5db' : '#374151';
  const gridColor = resolvedTheme === 'dark' ? '#374151' : '#e5e7eb';

  const chartData = useMemo(() => {
    return [...snapshots.slice(0, 10)].reverse().map((snapshot) => ({
      snapshotDate: snapshot.snapshotDate,
      id: snapshot.id,
      name: abbreviateReportTitle(snapshot.title),
      netWorth: snapshot.netWorth,
      title: snapshot.title,
      totalAssets: snapshot.totalAssets,
      totalLiabilities: snapshot.totalLiabilities,
    }));
  }, [snapshots]);

  if (chartData.length < 2) {
    return null;
  }

  const handleDotClick = (_event: unknown, data: unknown) => {
    const payload = (data as { payload?: { id: string } }).payload;
    if (payload?.id) {
      navigate(`/net-worth/${payload.id}`);
    }
  };

  const commonAxisProps = {
    gridColor,
    tickColor,
  };

  const latest = chartData[chartData.length - 1];
  const strokeColor = latest.netWorth >= 0 ? '#10b981' : '#ef4444';

  if (view === 'breakdown') {
    return (
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart
          data={chartData}
          margin={{ top: 8, right: 16, bottom: 8, left: 16 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={commonAxisProps.gridColor}
            vertical={false}
          />

          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: commonAxisProps.tickColor }}
          />

          <YAxis
            tickFormatter={(value: number) => `${formatMoney(value)}€`}
            tick={{ fontSize: 12, fill: commonAxisProps.tickColor }}
            width={80}
          />

          <Tooltip content={<BreakdownChartTooltip />} />

          <Legend
            content={() => (
              <div className="flex justify-center gap-4 pt-1 text-xs text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  Assets
                </span>

                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
                  Liabilities
                </span>
              </div>
            )}
          />

          <Area
            type="monotone"
            dataKey="totalAssets"
            stroke="#10b981"
            strokeWidth={2}
            fill="#10b981"
            fillOpacity={0.1}
            dot={{ cursor: 'pointer', fill: '#10b981', r: 3 }}
            activeDot={{ cursor: 'pointer', onClick: handleDotClick }}
            isAnimationActive={false}
          />

          <Area
            type="monotone"
            dataKey="totalLiabilities"
            stroke="#ef4444"
            strokeWidth={2}
            fill="#ef4444"
            fillOpacity={0.1}
            dot={{ cursor: 'pointer', fill: '#ef4444', r: 3 }}
            activeDot={{ cursor: 'pointer', onClick: handleDotClick }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart
        data={chartData}
        margin={{ top: 8, right: 16, bottom: 8, left: 16 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={commonAxisProps.gridColor}
          vertical={false}
        />

        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: commonAxisProps.tickColor }}
        />

        <YAxis
          tickFormatter={(value: number) => `${formatMoney(value)}€`}
          tick={{ fontSize: 12, fill: commonAxisProps.tickColor }}
          width={80}
        />

        <Tooltip content={<NetWorthChartTooltip />} />

        <Legend
          content={() => (
            <div className="flex justify-center gap-4 pt-1 text-xs text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: strokeColor }}
                />
                Net Worth
              </span>
            </div>
          )}
        />

        <Line
          type="monotone"
          dataKey="netWorth"
          stroke={strokeColor}
          strokeWidth={2}
          dot={{ cursor: 'pointer', fill: strokeColor }}
          activeDot={{ cursor: 'pointer', onClick: handleDotClick }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
