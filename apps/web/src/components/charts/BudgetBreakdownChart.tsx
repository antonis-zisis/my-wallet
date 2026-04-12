import { useMemo } from 'react';
import {
  Legend,
  Pie,
  PieChart,
  type PieSectorShapeProps,
  Sector,
  Tooltip,
} from 'recharts';

import { type Transaction } from '../../types/transaction';
import { formatMoney } from '../../utils/formatMoney';

interface BudgetBreakdownChartProps {
  transactions: Array<Transaction>;
}

const BUCKET_COLORS: Record<string, string> = {
  Needs: '#3b82f6',
  Wants: '#f59e0b',
  Invest: '#10b981',
};

export const CATEGORY_TO_BUCKET: Record<string, string> = {
  Groceries: 'Needs',
  'Dining Out': 'Wants',
  Rent: 'Needs',
  Transport: 'Needs',
  Utilities: 'Needs',
  Health: 'Needs',
  Insurance: 'Needs',
  Loan: 'Needs',
  Entertainment: 'Wants',
  Shopping: 'Wants',
  Other: 'Wants',
  Investment: 'Invest',
};

interface ChartDataItem {
  name: string;
  value: number;
  fill: string;
}

const RADIAN = Math.PI / 180;

const renderShape = ({
  cx,
  cy,
  endAngle,
  fill,
  innerRadius,
  isActive,
  midAngle,
  outerRadius,
  payload,
  percent,
  startAngle,
  value,
}: PieSectorShapeProps) => {
  if (!isActive) {
    return (
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    );
  }
  const sin = Math.sin(-RADIAN * (midAngle ?? 0));
  const cos = Math.cos(-RADIAN * (midAngle ?? 0));
  const sx = (cx ?? 0) + ((outerRadius ?? 0) + 10) * cos;
  const sy = (cy ?? 0) + ((outerRadius ?? 0) + 10) * sin;
  const mx = (cx ?? 0) + ((outerRadius ?? 0) + 30) * cos;
  const my = (cy ?? 0) + ((outerRadius ?? 0) + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';
  const item = payload as unknown as ChartDataItem;

  return (
    <g>
      <text
        x={cx}
        y={cy}
        dy={8}
        textAnchor="middle"
        fill={fill}
        fontSize={13}
        fontWeight={500}
      >
        {item.name}
      </text>

      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />

      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={(outerRadius ?? 0) + 6}
        outerRadius={(outerRadius ?? 0) + 10}
        fill={fill}
      />

      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />

      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />

      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#6b7280"
        fontSize={13}
        fontWeight={600}
      >
        {`${formatMoney(value ?? 0)} €`}
      </text>

      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#9ca3af"
        fontSize={12}
      >
        {`(${((percent ?? 0) * 100).toFixed(1)}%)`}
      </text>
    </g>
  );
};

export function BudgetBreakdownChart({
  transactions,
}: BudgetBreakdownChartProps) {
  const chartData = useMemo(() => {
    const buckets = new Map<string, number>();

    for (const tx of transactions) {
      if (tx.type !== 'EXPENSE') {
        continue;
      }

      const bucket = CATEGORY_TO_BUCKET[tx.category] ?? 'Wants';
      const current = buckets.get(bucket) ?? 0;

      buckets.set(bucket, current + tx.amount);
    }

    const bucketOrder = ['Needs', 'Wants', 'Invest'];

    return Array.from(buckets.entries())
      .map(([name, value]) => ({
        name,
        value,
        fill: BUCKET_COLORS[name],
      }))
      .sort(
        (aa, bb) => bucketOrder.indexOf(aa.name) - bucketOrder.indexOf(bb.name)
      );
  }, [transactions]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <PieChart
      responsive
      style={{ width: '100%', aspectRatio: '4/3', maxHeight: '360px' }}
      margin={{ top: 20, right: 140, bottom: 20, left: 140 }}
    >
      <Pie
        shape={renderShape}
        data={chartData}
        cx="50%"
        cy="50%"
        innerRadius="45%"
        outerRadius="65%"
        dataKey="value"
        stroke="none"
      />

      <Tooltip content={() => null} defaultIndex={0} active />

      <Legend
        layout="vertical"
        align="left"
        verticalAlign="middle"
        content={() => (
          <ul className="flex w-30 flex-col gap-2 pl-2 text-sm">
            {chartData.map((item) => (
              <li key={item.name} className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3"
                  style={{ backgroundColor: item.fill }}
                />
                <span style={{ color: item.fill }}>{item.name}</span>
              </li>
            ))}
          </ul>
        )}
      />
    </PieChart>
  );
}
