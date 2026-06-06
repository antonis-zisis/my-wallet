import { describe, expect, it } from 'vitest';

import { makeTransaction } from '../../../test/fixtures/report';
import { getPresentCategories } from './getPresentCategories';

describe('getPresentCategories', () => {
  it('returns categories that are present in transactions of the given type', () => {
    const transactions = [
      makeTransaction({ type: 'EXPENSE', category: 'Groceries' }),
      makeTransaction({ type: 'EXPENSE', category: 'Rent' }),
    ];

    const result = getPresentCategories(
      ['Groceries', 'Rent', 'Utilities'],
      transactions,
      'EXPENSE'
    );

    expect(result).toEqual(['Groceries', 'Rent']);
  });

  it('ignores transactions of the wrong type', () => {
    const transactions = [
      makeTransaction({ type: 'EXPENSE', category: 'Salary' }),
      makeTransaction({ type: 'INCOME', category: 'Salary' }),
    ];

    const result = getPresentCategories(['Salary'], transactions, 'INCOME');

    expect(result).toEqual(['Salary']);
  });

  it('returns an empty array when no transactions match', () => {
    const result = getPresentCategories(['Rent'], [], 'EXPENSE');

    expect(result).toEqual([]);
  });
});
