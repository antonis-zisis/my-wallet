import { useMemo } from 'react';
import {
  Legend,
  Pie,
  PieChart,
  type PieSectorDataItem,
  Sector,
  Tooltip,
} from 'recharts';

import { type Transaction } from '../../types/transaction';

interface ExpenseBreakdownChartProps {
  transactions: Transaction[];
}

const COLORS = [
  '#3b82f6',
  '#f59e0b',
  '#10b981',
  '#8b5cf6',
  '#ef4444',
  '#06b6d4',
  '#f97316',
];

const RADIAN = Math.PI / 180;

interface ChartDataItem {
  name: string;
  value: number;
  fill: string;
}

const renderActiveShape = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  startAngle,
  endAngle,
  fill,
  payload,
  percent,
  value,
}: PieSectorDataItem) => {
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
        {`€${(value ?? 0).toFixed(2)}`}
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

export function ExpenseBreakdownChart({
  transactions,
}: ExpenseBreakdownChartProps) {
  const chartData = useMemo(() => {
    const expensesByCategory = new Map<string, number>();

    for (const tx of transactions) {
      if (tx.type !== 'EXPENSE') continue;
      const current = expensesByCategory.get(tx.category) ?? 0;
      expensesByCategory.set(tx.category, current + tx.amount);
    }

    return Array.from(expensesByCategory.entries())
      .map(([name, value], index) => ({
        name,
        value,
        fill: COLORS[index % COLORS.length],
      }))
      .sort((aa, bb) => bb.value - aa.value);
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
        activeShape={renderActiveShape}
        data={chartData}
        cx="50%"
        cy="50%"
        innerRadius="45%"
        outerRadius="65%"
        dataKey="value"
        stroke="none"
      />
      <Tooltip content={() => null} defaultIndex={0} />
      <Legend />
    </PieChart>
  );
}
