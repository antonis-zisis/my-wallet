import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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

import { useTheme } from '../../contexts/ThemeContext';
import { type Report } from '../../types/report';
import { formatMoney } from '../../utils/formatMoney';

interface IncomeExpensesChartProps {
  reports: Array<Report>;
  limit?: number;
}

export function IncomeExpensesChart({
  limit = 12,
  reports,
}: IncomeExpensesChartProps) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const tickColor = theme === 'dark' ? '#d1d5db' : '#374151';

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

        return { id: report.id, name, income, expenses };
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

        <XAxis dataKey="name" tick={{ fontSize: 12, fill: tickColor }} />

        <YAxis
          tickFormatter={(value: number) => `${formatMoney(value)}€`}
          tick={{ fontSize: 12, fill: tickColor }}
          width={64}
        />

        <Tooltip
          itemSorter={(item) => (item.name === 'income' ? 0 : 1)}
          formatter={(value, name) => [
            `${formatMoney(typeof value === 'number' ? value : 0)} €`,
            String(name ?? '')
              .charAt(0)
              .toUpperCase() + String(name ?? '').slice(1),
          ]}
          contentStyle={{
            borderRadius: '4px',
            border: '1px solid #e5e7eb',
            fontSize: '13px',
          }}
        />

        <Legend
          content={() => (
            <div className="flex justify-center gap-4 pt-1 text-xs text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Income
              </span>

              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
                Expenses
              </span>
            </div>
          )}
        />

        <Bar
          dataKey="income"
          name="income"
          fill="#10b981"
          radius={[4, 4, 0, 0]}
          cursor="pointer"
          onClick={(data) => navigate(`/reports/${data.payload.id}`)}
        />

        <Bar
          dataKey="expenses"
          name="expenses"
          fill="#ef4444"
          radius={[4, 4, 0, 0]}
          cursor="pointer"
          onClick={(data) => navigate(`/reports/${data.payload.id}`)}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
