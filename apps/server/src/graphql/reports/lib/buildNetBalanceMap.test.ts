import { describe, expect, it } from 'vitest';

import { buildNetBalanceMap } from './buildNetBalanceMap';

describe('buildNetBalanceMap', () => {
  it('returns an empty map for no rows', () => {
    expect(buildNetBalanceMap([]).size).toBe(0);
  });

  it('subtracts expenses from income per report', () => {
    const map = buildNetBalanceMap([
      { reportId: 'a', type: 'INCOME', _sum: { amount: 1000 } },
      { reportId: 'a', type: 'EXPENSE', _sum: { amount: 400 } },
      { reportId: 'b', type: 'EXPENSE', _sum: { amount: 250 } },
    ]);

    expect(map.get('a')).toBe(600);
    expect(map.get('b')).toBe(-250);
  });

  it('treats a null sum as zero', () => {
    const map = buildNetBalanceMap([
      { reportId: 'a', type: 'INCOME', _sum: { amount: null } },
    ]);

    expect(map.get('a')).toBe(0);
  });
});
