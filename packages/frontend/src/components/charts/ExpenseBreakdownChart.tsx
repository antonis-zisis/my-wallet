import { useMemo } from 'react';
import { Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { Transaction } from '../../types/transaction';

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

interface TooltipEntry {
  name: string;
  value: number;
  fill: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: TooltipEntry }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const { name, value, fill } = payload[0].payload;

  return (
    <div className="rounded-lg bg-gray-900 px-3 py-2 shadow-lg ring-1 ring-white/10">
      <div className="flex items-center gap-2">
        <span
          className="inline-block size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: fill }}
        />
        <span className="text-sm font-medium text-white">{name}</span>
      </div>

      <p className="mt-1 text-right text-sm font-semibold text-white">
        €{value.toFixed(2)}
      </p>
    </div>
  );
}

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
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          stroke="none"
        />
        <Tooltip content={<CustomTooltip />} defaultIndex={0} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
