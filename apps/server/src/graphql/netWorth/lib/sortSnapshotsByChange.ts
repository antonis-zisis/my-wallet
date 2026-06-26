type EntryLike = { type: string; amount: number };

type SnapshotLike = { entries: Array<EntryLike> };

function computeNetWorth(entries: Array<EntryLike>): number {
  return entries.reduce(
    (sum, entry) =>
      entry.type === 'ASSET' ? sum + entry.amount : sum - entry.amount,
    0
  );
}

export function sortSnapshotsByChange<T extends SnapshotLike>(
  snapshotsOldestFirst: Array<T>,
  order: 'ASC' | 'DESC'
): Array<T> {
  let previousNetWorth: number | null = null;

  const withChange = snapshotsOldestFirst.map((snapshot) => {
    const netWorth = computeNetWorth(snapshot.entries);
    const change =
      previousNetWorth === null ? null : netWorth - previousNetWorth;

    previousNetWorth = netWorth;

    return { snapshot, change };
  });

  withChange.sort((left, right) => {
    if (left.change === null) {
      return 1;
    }

    if (right.change === null) {
      return -1;
    }

    const difference = left.change - right.change;

    return order === 'ASC' ? difference : -difference;
  });

  return withChange.map((entry) => entry.snapshot);
}
