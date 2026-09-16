import { NetWorthEntry, NetWorthSnapshot } from '../../generated/prisma/client';

export function makeNetWorthSnapshot(
  overrides: Partial<NetWorthSnapshot> = {}
): NetWorthSnapshot {
  return {
    id: 'snapshot-1',
    title: 'January 2024',
    snapshotDate: new Date('2024-01-01T00:00:00Z'),
    userId: 'user-1',
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
    ...overrides,
  };
}

export function makeNetWorthEntry(
  overrides: Partial<NetWorthEntry> = {}
): NetWorthEntry {
  return {
    id: 'entry-1',
    type: 'ASSET',
    label: 'Savings Account',
    amount: 10000,
    category: 'Savings',
    notes: null,
    snapshotId: 'snapshot-1',
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
    ...overrides,
  };
}
