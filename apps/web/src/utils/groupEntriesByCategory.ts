import { NetWorthEntry } from '../types/netWorth';

export function groupEntriesByCategory(
  entries: Array<NetWorthEntry>
): Array<[string, Array<NetWorthEntry>]> {
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

  return Object.entries(byCategory)
    .sort(([categoryA], [categoryB]) => categoryA.localeCompare(categoryB))
    .map(([category, categoryEntries]) => [
      category,
      [...categoryEntries].sort((entryA, entryB) =>
        entryA.label.localeCompare(entryB.label)
      ),
    ]);
}
