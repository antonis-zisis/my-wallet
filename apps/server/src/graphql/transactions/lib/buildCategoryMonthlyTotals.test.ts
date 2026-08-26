import { describe, expect, it } from 'vitest';

import { buildCategoryMonthlyTotals } from './buildCategoryMonthlyTotals';

describe('buildCategoryMonthlyTotals', () => {
  it('returns an empty array when given no transactions', () => {
    const result = buildCategoryMonthlyTotals([]);

    expect(result).toEqual([]);
  });

  it('sums transactions sharing a category and month', () => {
    const result = buildCategoryMonthlyTotals([
      { amount: 40, category: 'Groceries', date: new Date('2026-08-02') },
      { amount: 12.5, category: 'Groceries', date: new Date('2026-08-19') },
    ]);

    expect(result).toEqual([
      { category: 'Groceries', month: '2026-08', total: 52.5 },
    ]);
  });

  it('keeps different categories in the same month separate', () => {
    const result = buildCategoryMonthlyTotals([
      { amount: 40, category: 'Groceries', date: new Date('2026-08-02') },
      { amount: 800, category: 'Rent', date: new Date('2026-08-01') },
    ]);

    expect(result).toEqual([
      { category: 'Groceries', month: '2026-08', total: 40 },
      { category: 'Rent', month: '2026-08', total: 800 },
    ]);
  });

  it('keeps the same category in different months separate', () => {
    const result = buildCategoryMonthlyTotals([
      { amount: 40, category: 'Groceries', date: new Date('2026-07-30') },
      { amount: 55, category: 'Groceries', date: new Date('2026-08-01') },
    ]);

    expect(result).toEqual([
      { category: 'Groceries', month: '2026-07', total: 40 },
      { category: 'Groceries', month: '2026-08', total: 55 },
    ]);
  });
});
