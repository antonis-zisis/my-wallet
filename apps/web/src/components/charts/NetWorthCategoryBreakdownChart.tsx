import { useMemo } from 'react';

import {
  type NetWorthEntry,
  type NetWorthEntryType,
} from '../../types/netWorth';
import { formatMoney } from '../../utils/formatMoney';
import {
  ASSET_CATEGORY_COLORS,
  FALLBACK_CATEGORY_COLOR,
  LIABILITY_CATEGORY_COLORS,
} from './categoryColors';

interface NetWorthCategoryBreakdownChartProps {
  entries: Array<NetWorthEntry>;
  type: NetWorthEntryType;
}

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
      fill: colorMap[name] ?? FALLBACK_CATEGORY_COLOR,
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
            <span className="text-text-secondary text-xs">{item.name}</span>
            <span className="text-text-primary text-xs font-medium">
              {formatMoney(item.value)} €
            </span>
            <span className="text-text-tertiary text-xs">
              ({item.percentage.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
