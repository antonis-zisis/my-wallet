import { describe, expect, it } from 'vitest';

import { findPreviousSnapshotIds } from './findPreviousSnapshotIds';

const january = {
  id: 'january',
  userId: 'user-1',
  snapshotDate: new Date('2024-01-01T00:00:00Z'),
};
const february = {
  id: 'february',
  userId: 'user-1',
  snapshotDate: new Date('2024-02-01T00:00:00Z'),
};
const march = {
  id: 'march',
  userId: 'user-1',
  snapshotDate: new Date('2024-03-01T00:00:00Z'),
};

const oldestFirst = [january, february, march];

describe('findPreviousSnapshotIds', () => {
  it('maps each snapshot to the nearest earlier one', () => {
    const result = findPreviousSnapshotIds([march, february], oldestFirst);

    expect(result.get('march')).toBe('february');
    expect(result.get('february')).toBe('january');
  });

  it('leaves the earliest snapshot without a predecessor', () => {
    const result = findPreviousSnapshotIds([january], oldestFirst);

    expect(result.has('january')).toBe(false);
  });

  it('ignores snapshots belonging to another user', () => {
    const otherUsersFebruary = {
      id: 'other-february',
      userId: 'user-2',
      snapshotDate: new Date('2024-02-15T00:00:00Z'),
    };

    const result = findPreviousSnapshotIds(
      [march],
      [january, february, otherUsersFebruary, march]
    );

    expect(result.get('march')).toBe('february');
  });
});
