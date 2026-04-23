import { useMemo } from 'react';

import {
  type NetWorthEntry,
  type NetWorthEntryType,
} from '../../types/netWorth';
import { formatMoney } from '../../utils/formatMoney';

interface NetWorthCategoryBreakdownChartProps {
  entries: Array<NetWorthEntry>;
  type: NetWorthEntryType;
}

const ASSET_CATEGORY_COLORS: Record<string, string> = {
  Brokerage: '#06b6d4',
  Crypto: '#f59e0b',
  Investments: '#10b981',
  Other: '#9ca3af',
  'Real Estate': '#ef4444',
  Retirement: '#8b5cf6',
  Savings: '#3b82f6',
  Vehicle: '#6366f1',
};

const LIABILITY_CATEGORY_COLORS: Record<string, string> = {
  'Car Loan': '#f97316',
  'Credit Card': '#ec4899',
  Mortgage: '#dc2626',
  Other: '#9ca3af',
  'Personal Loan': '#8b5cf6',
  'Student Loan': '#f59e0b',
};

export function NetWorthCategoryBreakdownChart({
  entries,
  type,
}: NetWorthCategoryBreakdownChartProps) {
  const chartData = useMemo(() => {
    const colorMap =
      type === 'ASSET' ? ASSET_CATEGORY_COLORS : LIABILITY_CATEGORY_COLORS;
    const byCategory = new Map<string, number>();

    for (const entry of entries) {
      byCategory.set(
        entry.category,
        (byCategory.get(entry.category) ?? 0) + entry.amount
      );
    }

    const total = Array.from(byCategory.values()).reduce(
      (sum, value) => sum + value,
      0
    );

    return Array.from(byCategory.entries()).map(([name, value]) => ({
      fill: colorMap[name] ?? '#9ca3af',
      name,
      percentage: total > 0 ? (value / total) * 100 : 0,
      value,
    }));
  }, [entries, type]);

  if (chartData.length < 1) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex h-2.5 w-full overflow-hidden rounded-full">
        {chartData.map((item) => (
          <div
            key={item.name}
            style={{ backgroundColor: item.fill, width: `${item.percentage}%` }}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: item.fill }}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {item.name}
            </span>
            <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
              {formatMoney(item.value)} €
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              ({item.percentage.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
