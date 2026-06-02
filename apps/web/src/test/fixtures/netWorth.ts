import { NetWorthEntry, NetWorthSnapshot } from '../../types/netWorth';

export function makeNetWorthEntry(
  overrides: Partial<NetWorthEntry> = {}
): NetWorthEntry {
  return {
    id: 'entry-1',
    type: 'ASSET',
    label: 'Savings account',
    amount: 1000,
    category: 'Savings',
    notes: null,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function makeNetWorthSnapshot(
  overrides: Partial<NetWorthSnapshot> = {}
): NetWorthSnapshot {
  return {
    id: 'snapshot-1',
    title: 'January 2025',
    snapshotDate: '2025-01-15T00:00:00.000Z',
    totalAssets: 0,
    totalLiabilities: 0,
    netWorth: 0,
    entries: [],
    previousSnapshot: null,
    createdAt: '2025-01-15T00:00:00.000Z',
    updatedAt: '2025-01-15T00:00:00.000Z',
    ...overrides,
  };
}
