import { NetWorthEntry } from '../../types/netWorth';
import { formatMoney } from '../../utils/formatMoney';
import { Card } from '../ui';

interface NetWorthEntriesSectionProps {
  colorClass: string;
  entries: Array<NetWorthEntry>;
  title: string;
  total: number;
}

export function NetWorthEntriesSection({
  colorClass,
  entries,
  title,
  total,
}: NetWorthEntriesSectionProps) {
  if (entries.length === 0) {
    return null;
  }

  const byCategory = entries.reduce<Record<string, Array<NetWorthEntry>>>(
    (accumulator, entry) => {
      if (!accumulator[entry.category]) {
        accumulator[entry.category] = [];
      }
      accumulator[entry.category].push(entry);
      return accumulator;
    },
    {}
  );

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className={`text-lg font-semibold ${colorClass}`}>{title}</h2>
        <span className={`font-semibold ${colorClass}`}>
          {formatMoney(total)} €
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        {Object.entries(byCategory).map(([category, categoryEntries]) => (
          <div key={category}>
            <div className="bg-gray-50 px-4 py-2 text-xs font-medium tracking-wider text-gray-500 uppercase dark:bg-gray-700/50 dark:text-gray-400">
              {category}
            </div>

            {categoryEntries.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between px-4 py-3 ${
                  index < categoryEntries.length - 1
                    ? 'border-b border-gray-100 dark:border-gray-700'
                    : ''
                }`}
              >
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  {entry.label}
                </span>

                <span className={`text-sm font-medium ${colorClass}`}>
                  {formatMoney(entry.amount)} €
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}
