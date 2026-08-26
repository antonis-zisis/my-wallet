import { useMemo } from 'react';
import { Legend, Pie, PieChart, Tooltip } from 'recharts';

import { usePrivacy } from '../../contexts/PrivacyContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useIsMobileViewport } from '../../hooks/useIsMobileViewport';
import { type Transaction } from '../../types/transaction';
import { BUDGET_BUCKET_COLORS } from './categoryColors';
import { makeBreakdownPieShape } from './makeBreakdownPieShape';

type BudgetBreakdownChartProps = {
  transactions: Array<Transaction>;
};

export const CATEGORY_TO_BUCKET: Record<string, string> = {
  'Dining Out': 'Wants',
  Entertainment: 'Wants',
  Groceries: 'Needs',
  Health: 'Needs',
  Insurance: 'Needs',
  Investment: 'Invest',
  Loan: 'Needs',
  Other: 'Wants',
  Rent: 'Needs',
  Shopping: 'Wants',
  Transport: 'Needs',
  Utilities: 'Needs',
};

export function BudgetBreakdownChart({
  transactions,
}: BudgetBreakdownChartProps) {
  const { resolvedTheme } = useTheme();
  const { isAmountsHidden } = usePrivacy();
  const labelColor = resolvedTheme === 'dark' ? '#9ca3af' : '#4b5563';
  const isMobile = useIsMobileViewport();
  const renderShape = useMemo(
    () =>
      makeBreakdownPieShape({
        isAmountsHidden,
        isCompact: isMobile,
        labelColor,
      }),
    [isAmountsHidden, isMobile, labelColor]
  );

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
        fill: BUDGET_BUCKET_COLORS[name],
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
      style={{
        width: '100%',
        aspectRatio: isMobile ? '1/1' : '4/3',
        maxHeight: '360px',
      }}
      margin={
        isMobile
          ? { top: 8, right: 8, bottom: 8, left: 8 }
          : { top: 20, right: 140, bottom: 20, left: 140 }
      }
    >
      <Pie
        shape={renderShape}
        data={chartData}
        cx="50%"
        cy="50%"
        innerRadius={isMobile ? '52%' : '45%'}
        outerRadius={isMobile ? '70%' : '65%'}
        dataKey="value"
        stroke="none"
      />

      <Tooltip content={() => null} defaultIndex={0} active />

      <Legend
        layout={isMobile ? 'horizontal' : 'vertical'}
        align={isMobile ? 'center' : 'left'}
        verticalAlign={isMobile ? 'bottom' : 'middle'}
        content={() => (
          <ul
            className={
              isMobile
                ? 'flex flex-wrap justify-center gap-x-3 gap-y-1.5 pt-2 text-xs'
                : 'flex w-30 flex-col gap-2 pl-2 text-sm'
            }
          >
            {chartData.map((item) => (
              <li key={item.name} className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 shrink-0"
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
