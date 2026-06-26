import { describe, expect, it } from 'vitest';

import { sortSnapshotsByChange } from './sortSnapshotsByChange';

const snapshot = (id: string, netWorth: number) => ({
  id,
  entries: [{ type: 'ASSET', amount: netWorth }],
});

describe('sortSnapshotsByChange', () => {
  it('orders by net-worth change descending', () => {
    const ordered = sortSnapshotsByChange(
      [snapshot('a', 1000), snapshot('b', 1100), snapshot('c', 1150)],
      'DESC'
    );

    expect(ordered.map((entry) => entry.id)).toEqual(['b', 'c', 'a']);
  });

  it('orders by net-worth change ascending', () => {
    const ordered = sortSnapshotsByChange(
      [snapshot('a', 1000), snapshot('b', 800), snapshot('c', 850)],
      'ASC'
    );

    expect(ordered.map((entry) => entry.id)).toEqual(['b', 'c', 'a']);
  });

  it('always sorts the changeless earliest snapshot last', () => {
    const ordered = sortSnapshotsByChange(
      [snapshot('a', 500), snapshot('b', 400)],
      'DESC'
    );

    expect(ordered[ordered.length - 1].id).toBe('a');
  });

  it('nets assets against liabilities when computing change', () => {
    const ordered = sortSnapshotsByChange(
      [
        { id: 'a', entries: [{ type: 'ASSET', amount: 1000 }] },
        {
          id: 'b',
          entries: [
            { type: 'ASSET', amount: 1000 },
            { type: 'LIABILITY', amount: 300 },
          ],
        },
      ],
      'DESC'
    );

    expect(ordered.map((entry) => entry.id)).toEqual(['b', 'a']);
  });
});
