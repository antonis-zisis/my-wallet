import { EntryDelta, NetWorthEntry } from '../../../types/netWorth';

export function buildEntryDeltas(
  entries: Array<NetWorthEntry>,
  previousEntryAmounts: Record<string, number>
): Record<string, EntryDelta> {
  const result: Record<string, EntryDelta> = {};

  for (const entry of entries) {
    const key = `${entry.category}:${entry.label}`;
    const lookupKey = `${entry.type}:${entry.category}:${entry.label}`;

    if (lookupKey in previousEntryAmounts) {
      result[key] = {
        delta: entry.amount - previousEntryAmounts[lookupKey],
        isNew: false,
      };
    } else {
      result[key] = { delta: 0, isNew: true };
    }
  }

  return result;
}
