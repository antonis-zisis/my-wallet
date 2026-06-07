import { describe, expect, it } from 'vitest';

import { makeNetWorthSnapshot } from '../../../test/fixtures';
import { buildTrendChartData } from './buildTrendChartData';

describe('buildTrendChartData', () => {
  it('returns an empty array when given no snapshots', () => {
    const result = buildTrendChartData([]);

    expect(result).toEqual([]);
  });

  it('reverses the snapshot order so the oldest comes first', () => {
    const snapshots = [
      makeNetWorthSnapshot({ id: 'newer', title: 'March 2025' }),
      makeNetWorthSnapshot({ id: 'older', title: 'February 2025' }),
    ];

    const result = buildTrendChartData(snapshots);

    expect(result.map((datum) => datum.id)).toEqual(['older', 'newer']);
  });

  it('caps the output at 10 snapshots, keeping only the most recent', () => {
    const snapshots = Array.from({ length: 12 }, (_, index) =>
      makeNetWorthSnapshot({
        id: `snapshot-${index}`,
        title: `Snapshot ${index}`,
      })
    );

    const result = buildTrendChartData(snapshots);

    expect(result).toHaveLength(10);
    expect(result.map((datum) => datum.id)).toEqual([
      'snapshot-9',
      'snapshot-8',
      'snapshot-7',
      'snapshot-6',
      'snapshot-5',
      'snapshot-4',
      'snapshot-3',
      'snapshot-2',
      'snapshot-1',
      'snapshot-0',
    ]);
  });

  it('shapes each datum with the recharts fields and an abbreviated name', () => {
    const snapshots = [
      makeNetWorthSnapshot({
        id: 'snapshot-1',
        title: 'February 2025',
        snapshotDate: '2025-02-15T00:00:00.000Z',
        netWorth: 5000,
        totalAssets: 7000,
        totalLiabilities: 2000,
      }),
    ];

    const [datum] = buildTrendChartData(snapshots);

    expect(datum).toEqual({
      snapshotDate: '2025-02-15T00:00:00.000Z',
      id: 'snapshot-1',
      name: expect.any(String),
      netWorth: 5000,
      title: 'February 2025',
      totalAssets: 7000,
      totalLiabilities: 2000,
    });
  });
});
