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
import { abbreviateReportTitle } from '../../utils/abbreviateReportTitle';
import { formatMoney } from '../../utils/formatMoney';

interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
}

interface ChartTooltipProps {
  active?: boolean;
  label?: string;
  payload?: Array<TooltipPayloadEntry>;
}

function ChartTooltip({ active, label, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const income = payload.find((entry) => entry.name === 'income');
  const expenses = payload.find((entry) => entry.name === 'expenses');

  return (
    <div className="bg-bg-surface ring-border rounded px-4 py-3 shadow-lg ring-1">
      <p className="text-text-secondary mb-2 text-xs font-semibold">{label}</p>

      <div className="space-y-1.5">
        {income && (
          <div className="flex items-center justify-between gap-6">
            <span className="text-text-secondary flex items-center gap-1.5 text-xs">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Income
            </span>
            <span className="text-text-primary text-xs font-semibold">
              {formatMoney(income.value)} €
            </span>
          </div>
        )}

        {expenses && (
          <div className="flex items-center justify-between gap-6">
            <span className="text-text-secondary flex items-center gap-1.5 text-xs">
              <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
              Expenses
            </span>
            <span className="text-text-primary text-xs font-semibold">
              {formatMoney(expenses.value)} €
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

interface IncomeExpensesChartProps {
  reports: Array<Report>;
  limit?: number;
}

export function IncomeExpensesChart({
  limit = 12,
  reports,
}: IncomeExpensesChartProps) {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const tickColor = resolvedTheme === 'dark' ? '#d1d5db' : '#374151';
  const gridColor = resolvedTheme === 'dark' ? '#374151' : '#e5e7eb';

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

        const name = abbreviateReportTitle(report.title);

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
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={gridColor}
          vertical={false}
        />

        <XAxis dataKey="name" tick={{ fontSize: 12, fill: tickColor }} />

        <YAxis
          tickFormatter={(value: number) => `${formatMoney(value)}€`}
          tick={{ fontSize: 12, fill: tickColor }}
          width={64}
        />

        <Tooltip content={<ChartTooltip />} />

        <Legend
          content={() => (
            <div className="text-text-secondary flex justify-center gap-4 pt-1 text-xs">
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
