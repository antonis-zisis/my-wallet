import { describe, expect, it } from 'vitest';

import { makeNetWorthEntry } from '../../../test/fixtures/netWorth';
import { buildEntryDeltas } from './buildEntryDeltas';

describe('buildEntryDeltas', () => {
  it('returns the amount difference for an entry that existed in the previous snapshot', () => {
    const entries = [
      makeNetWorthEntry({
        type: 'ASSET',
        category: 'Savings',
        label: 'Savings Account',
        amount: 1200,
      }),
    ];
    const previousEntryAmounts = { 'ASSET:Savings:Savings Account': 1000 };

    const result = buildEntryDeltas(entries, previousEntryAmounts);

    expect(result['Savings:Savings Account']).toEqual({
      delta: 200,
      isNew: false,
    });
  });

  it('marks an entry as new when its lookup key is absent from previousEntryAmounts', () => {
    const entries = [
      makeNetWorthEntry({
        type: 'ASSET',
        category: 'Investments',
        label: 'Stocks',
        amount: 500,
      }),
    ];

    const result = buildEntryDeltas(entries, {});

    expect(result['Investments:Stocks']).toEqual({ delta: 0, isNew: true });
  });

  it('returns a zero delta when the amount is unchanged', () => {
    const entries = [
      makeNetWorthEntry({
        type: 'LIABILITY',
        category: 'Credit Card',
        label: 'Card A',
        amount: 300,
      }),
    ];
    const previousEntryAmounts = { 'LIABILITY:Credit Card:Card A': 300 };

    const result = buildEntryDeltas(entries, previousEntryAmounts);

    expect(result['Credit Card:Card A']).toEqual({ delta: 0, isNew: false });
  });
});
