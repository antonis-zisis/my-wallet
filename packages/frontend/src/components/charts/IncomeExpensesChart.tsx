import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { type Report } from '../../types/report';
import { formatMoney } from '../../utils/formatMoney';

interface IncomeExpensesChartProps {
  reports: Array<Report>;
  limit?: number;
}

export function IncomeExpensesChart({
  reports,
  limit = 12,
}: IncomeExpensesChartProps) {
  const chartData = useMemo(() => {
    return [...reports]
      .slice(0, limit)
      .reverse()
      .map((report) => {
        const income = (report.transactions ?? [])
          .filter((tx) => tx.type === 'INCOME')
          .reduce((sum, tx) => sum + tx.amount, 0);
        const expenses = (report.transactions ?? [])
          .filter((tx) => tx.type === 'EXPENSE')
          .reduce((sum, tx) => sum + tx.amount, 0);
        const name =
          report.title.length > 14
            ? report.title.slice(0, 14) + '…'
            : report.title;
        return { name, income, expenses };
      });
  }, [reports, limit]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{ top: 8, right: 16, bottom: 8, left: 16 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
        <YAxis
          tickFormatter={(value: number) => `${formatMoney(value)}€`}
          tick={{ fontSize: 12, fill: '#6b7280' }}
          width={64}
        />
        <Tooltip
          formatter={(value: number | undefined, name: string | undefined) => [
            `${formatMoney(value ?? 0)} €`,
            (name ?? '').charAt(0).toUpperCase() + (name ?? '').slice(1),
          ]}
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            fontSize: '13px',
          }}
        />
        <Legend
          formatter={(value: string) =>
            value.charAt(0).toUpperCase() + value.slice(1)
          }
        />
        <Bar
          dataKey="income"
          name="income"
          fill="#10b981"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="expenses"
          name="expenses"
          fill="#ef4444"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
