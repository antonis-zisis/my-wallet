type SnapshotDate = {
  id: string;
  userId: string;
  snapshotDate: Date;
};

export function findPreviousSnapshotIds(
  snapshots: Array<SnapshotDate>,
  oldestFirst: Array<SnapshotDate>
): Map<string, string> {
  const previousIdBySnapshot = new Map<string, string>();

  for (const snapshot of snapshots) {
    let previousId: string | undefined;

    for (const candidate of oldestFirst) {
      if (candidate.snapshotDate >= snapshot.snapshotDate) {
        break;
      }

      if (candidate.userId === snapshot.userId) {
        previousId = candidate.id;
      }
    }

    if (previousId) {
      previousIdBySnapshot.set(snapshot.id, previousId);
    }
  }

  return previousIdBySnapshot;
}
