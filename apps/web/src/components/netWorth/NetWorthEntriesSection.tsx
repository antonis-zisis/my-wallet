import { useLocalStorage } from '../../hooks/useLocalStorage';
import { type EntryDelta, type NetWorthEntry } from '../../types/netWorth';
import { formatMoney } from '../../utils/formatMoney';
import { NetWorthCategoryBreakdownChart } from '../charts/NetWorthCategoryBreakdownChart';
import { ChevronDownIcon } from '../icons';
import { Badge, Card, Divider } from '../ui';

interface NetWorthEntriesSectionProps {
  colorClass: string;
  entries: Array<NetWorthEntry>;
  entryDeltas?: Record<string, EntryDelta>;
  title: string;
  total: number;
}

function EntryDeltaLabel({
  currentAmount,
  entryDelta,
}: {
  currentAmount: number;
  entryDelta: EntryDelta;
}) {
  if (entryDelta.isNew) {
    return (
      <Badge size="sm" variant="info">
        New
      </Badge>
    );
  }

  if (entryDelta.delta === 0) {
    return null;
  }

  const isPositive = entryDelta.delta > 0;
  const sign = isPositive ? '+' : '−';
  const colorClass = isPositive
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400';

  const previousAmount = currentAmount - entryDelta.delta;
  const percentage =
    previousAmount !== 0
      ? Math.abs((entryDelta.delta / Math.abs(previousAmount)) * 100)
      : null;

  return (
    <span className={`text-xs font-medium ${colorClass}`}>
      {sign}
      {formatMoney(Math.abs(entryDelta.delta))} €
      {percentage != null && (
        <span className="ml-1 opacity-70">
          ({sign}
          {percentage.toFixed(1)}%)
        </span>
      )}
    </span>
  );
}

export function NetWorthEntriesSection({
  colorClass,
  entries,
  entryDeltas,
  title,
  total,
}: NetWorthEntriesSectionProps) {
  const storageKey = `netWorthSnapshot.${title.toLowerCase()}.isCollapsed`;
  const [isCollapsed, setIsCollapsed] = useLocalStorage(storageKey, false);

  if (entries.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className={`text-lg font-semibold ${colorClass}`}>{title}</h2>
          <span className={`font-semibold ${colorClass}`}>
            {formatMoney(total)} €
          </span>
        </div>

        <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">
          No {title.toLowerCase()} recorded
        </p>
      </Card>
    );
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

  const categoryCount = Object.keys(byCategory).length;
  const entryType = entries[0].type;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-lg font-semibold ${colorClass}`}>{title}</h2>
        <div className="flex items-center gap-3">
          <span className={`font-semibold ${colorClass}`}>
            {formatMoney(total)} €
          </span>
          <button
            onClick={() => setIsCollapsed((previous) => !previous)}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            aria-label={isCollapsed ? 'Expand' : 'Collapse'}
            aria-expanded={!isCollapsed}
          >
            <ChevronDownIcon
              className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`}
            />
          </button>
        </div>
      </div>

      {categoryCount >= 1 && (
        <div className="mt-4">
          <NetWorthCategoryBreakdownChart entries={entries} type={entryType} />
        </div>
      )}

      <div
        className={`grid transition-all duration-300 ${isCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'}`}
      >
        <div className="overflow-hidden">
          {categoryCount >= 1 && (
            <div className="my-4">
              <Divider />
            </div>
          )}

          <div
            className={`overflow-hidden rounded border border-gray-200 dark:border-gray-700 ${categoryCount >= 1 ? '' : 'mt-4'}`}
          >
            {Object.entries(byCategory).map(([category, categoryEntries]) => (
              <div key={category}>
                <div className="bg-gray-50 px-4 py-2 text-xs font-medium tracking-wider text-gray-500 uppercase dark:bg-gray-700/50 dark:text-gray-400">
                  {category}
                </div>

                {categoryEntries.map((entry, index) => {
                  const deltaKey = `${entry.category}:${entry.label}`;
                  const entryDelta = entryDeltas?.[deltaKey];
                  const percentOfTotal =
                    total > 0
                      ? ((entry.amount / total) * 100).toFixed(1)
                      : null;

                  return (
                    <div
                      key={entry.id}
                      className={`grid grid-cols-[1fr_152px_136px] items-center px-4 py-2 ${
                        index < categoryEntries.length - 1
                          ? 'border-b border-gray-100 dark:border-gray-700'
                          : ''
                      }`}
                    >
                      <span className="min-w-0 truncate text-sm text-gray-700 dark:text-gray-200">
                        {entry.label}
                      </span>

                      <span className="text-right text-sm font-medium text-gray-800 dark:text-gray-100">
                        {formatMoney(entry.amount)} €
                        {percentOfTotal != null && (
                          <span className="ml-1.5 font-normal text-gray-400 dark:text-gray-500">
                            ({percentOfTotal}%)
                          </span>
                        )}
                      </span>

                      <div className="flex justify-end">
                        {entryDelta && (
                          <EntryDeltaLabel
                            currentAmount={entry.amount}
                            entryDelta={entryDelta}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
