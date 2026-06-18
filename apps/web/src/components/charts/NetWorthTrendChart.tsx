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

import { usePrivacy } from '../../contexts/PrivacyContext';
import { useTheme } from '../../contexts/ThemeContext';
import { buildTrendChartData } from '../../hooks/netWorth/selectors/buildTrendChartData';
import { NetWorthSnapshot } from '../../types/netWorth';
import { formatMoneyOrMask } from '../../utils/formatMoney';
import { BreakdownChartTooltip } from './netWorthTrend/BreakdownChartTooltip';
import { NetWorthChartTooltip } from './netWorthTrend/NetWorthChartTooltip';

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

type NetWorthTrendChartProps = {
  snapshots: Array<TrendSnapshot>;
  view: ChartView;
};

export function NetWorthTrendChart({
  snapshots,
  view,
}: NetWorthTrendChartProps) {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const { isAmountsHidden } = usePrivacy();
  const tickColor = resolvedTheme === 'dark' ? '#d1d5db' : '#374151';
  const gridColor = resolvedTheme === 'dark' ? '#374151' : '#e5e7eb';

  const chartData = useMemo(() => buildTrendChartData(snapshots), [snapshots]);

  if (chartData.length < 2) {
    return null;
  }

  const handleDotClick = (_event: unknown, data: unknown) => {
    const payload = (data as { payload?: { id: string } }).payload;
    if (payload?.id) {
      navigate(`/net-worth/${payload.id}`);
    }
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
            stroke={gridColor}
            vertical={false}
          />

          <XAxis dataKey="name" tick={{ fontSize: 12, fill: tickColor }} />

          <YAxis
            tickFormatter={(value: number) =>
              `${formatMoneyOrMask(value, isAmountsHidden)}€`
            }
            tick={{ fontSize: 12, fill: tickColor }}
            width={80}
          />

          <Tooltip content={<BreakdownChartTooltip />} />

          <Legend
            content={() => (
              <div className="text-text-secondary flex justify-center gap-4 pt-1 text-xs">
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
          stroke={gridColor}
          vertical={false}
        />

        <XAxis dataKey="name" tick={{ fontSize: 12, fill: tickColor }} />

        <YAxis
          tickFormatter={(value: number) =>
            `${formatMoneyOrMask(value, isAmountsHidden)}€`
          }
          tick={{ fontSize: 12, fill: tickColor }}
          width={80}
        />

        <Tooltip content={<NetWorthChartTooltip />} />

        <Legend
          content={() => (
            <div className="text-text-secondary flex justify-center gap-4 pt-1 text-xs">
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
