import {
  NetWorthEntry,
  NetWorthSnapshot,
} from '../../../generated/prisma/client';
import prisma from '../../../lib/prisma';
import { findPreviousSnapshotIds } from './findPreviousSnapshotIds';

const MAX_INDEXED_SNAPSHOTS = 1000;

type SnapshotIdentity = {
  id: string;
  userId: string;
  snapshotDate: Date;
};

type SnapshotWithEntries = NetWorthSnapshot & {
  entries: Array<NetWorthEntry>;
};

export async function attachPreviousSnapshots<
  SnapshotItem extends SnapshotIdentity,
>(
  snapshots: Array<SnapshotItem>
): Promise<
  Array<SnapshotItem & { previousSnapshot: SnapshotWithEntries | null }>
> {
  if (snapshots.length === 0) {
    return [];
  }

  const userIds = [...new Set(snapshots.map((snapshot) => snapshot.userId))];
  const oldestFirst = await prisma.netWorthSnapshot.findMany({
    where: { userId: { in: userIds } },
    select: { id: true, userId: true, snapshotDate: true },
    orderBy: { snapshotDate: 'asc' },
    take: MAX_INDEXED_SNAPSHOTS,
  });

  const previousIdBySnapshot = findPreviousSnapshotIds(snapshots, oldestFirst);
  const previousIds = [...new Set(previousIdBySnapshot.values())];

  const previousSnapshots =
    previousIds.length === 0
      ? []
      : await prisma.netWorthSnapshot.findMany({
          where: { id: { in: previousIds } },
          include: { entries: { orderBy: { createdAt: 'asc' } } },
        });

  const byId = new Map(
    previousSnapshots.map((snapshot) => [snapshot.id, snapshot])
  );

  return snapshots.map((snapshot) => {
    const previousId = previousIdBySnapshot.get(snapshot.id);

    return {
      ...snapshot,
      previousSnapshot: previousId ? (byId.get(previousId) ?? null) : null,
    };
  });
}
