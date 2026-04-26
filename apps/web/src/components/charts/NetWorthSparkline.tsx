import { Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts';

import { NetWorthSnapshot } from '../../types/netWorth';
import { formatMoney } from '../../utils/formatMoney';

interface NetWorthSparklineProps {
  isPositive: boolean;
  snapshots: Array<Pick<NetWorthSnapshot, 'id' | 'netWorth' | 'title'>>;
}

interface SparklineTooltipPayloadEntry {
  payload: { netWorth: number; title: string };
}

interface SparklineTooltipProps {
  active?: boolean;
  payload?: Array<SparklineTooltipPayloadEntry>;
}

function SparklineTooltip({ active, payload }: SparklineTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const { netWorth, title } = payload[0].payload;
  const sign = netWorth < 0 ? '-' : '';

  return (
    <div className="rounded bg-white px-3 py-2 shadow-lg ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
      <p className="text-text-secondary text-xs font-medium">{title}</p>

      <p className="text-text-primary text-xs font-semibold">
        {sign}
        {formatMoney(Math.abs(netWorth))} €
      </p>
    </div>
  );
}

export function NetWorthSparkline({
  isPositive,
  snapshots,
}: NetWorthSparklineProps) {
  if (snapshots.length < 2) {
    return null;
  }

  const chartData = snapshots.map((snapshot) => ({
    id: snapshot.id,
    netWorth: snapshot.netWorth,
    title: snapshot.title,
  }));

  const strokeColor = isPositive ? '#10b981' : '#ef4444';

  return (
    <ResponsiveContainer width="100%" height={48}>
      <LineChart
        data={chartData}
        margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
      >
        <Tooltip content={<SparklineTooltip />} cursor={false} />

        <Line
          type="monotone"
          dataKey="netWorth"
          stroke={strokeColor}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
