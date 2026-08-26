import { describe, expect, it } from 'vitest';

import { buildCategoryTrends } from './buildCategoryTrends';

const NOW = new Date('2026-08-26T00:00:00.000Z');

describe('buildCategoryTrends', () => {
  it('returns no tiles when there are no totals', () => {
    const result = buildCategoryTrends({
      now: NOW,
      totals: [],
      windowMonths: 3,
    });

    expect(result.trends).toEqual([]);
    expect(result.hasEnoughHistory).toBe(false);
  });

  it('zero-fills months the category has no spending in', () => {
    const result = buildCategoryTrends({
      now: NOW,
      totals: [
        { category: 'Groceries', month: '2026-06', total: 40 },
        { category: 'Groceries', month: '2026-08', total: 55 },
      ],
      windowMonths: 3,
    });

    expect(result.months).toEqual(['2026-06', '2026-07', '2026-08']);
    expect(result.trends[0].points).toEqual([
      { month: '2026-06', total: 40 },
      { month: '2026-07', total: 0 },
      { month: '2026-08', total: 55 },
    ]);
  });

  it('clamps the axis to the earliest month that has data', () => {
    const result = buildCategoryTrends({
      now: NOW,
      totals: [
        { category: 'Groceries', month: '2026-07', total: 40 },
        { category: 'Groceries', month: '2026-08', total: 55 },
      ],
      windowMonths: 12,
    });

    expect(result.months).toEqual(['2026-07', '2026-08']);
  });

  it('orders tiles by the expense category list, appending unknown categories', () => {
    const result = buildCategoryTrends({
      now: NOW,
      totals: [
        { category: 'Vet bills', month: '2026-07', total: 10 },
        { category: 'Groceries', month: '2026-07', total: 40 },
        { category: 'Rent', month: '2026-08', total: 800 },
      ],
      windowMonths: 3,
    });

    expect(result.trends.map((tile) => tile.category)).toEqual([
      'Rent',
      'Groceries',
      'Vet bills',
    ]);
  });

  it('computes the current total and delta against the previous month', () => {
    const result = buildCategoryTrends({
      now: NOW,
      totals: [
        { category: 'Dining Out', month: '2026-07', total: 120 },
        { category: 'Dining Out', month: '2026-08', total: 210 },
      ],
      windowMonths: 3,
    });

    expect(result.previousMonth).toBe('2026-07');
    expect(result.hasEnoughHistory).toBe(true);
    expect(result.trends[0].currentTotal).toBe(210);
    expect(result.trends[0].delta).toBe(90);
    expect(result.trends[0].maxTotal).toBe(210);
  });

  it('reports insufficient history when only one month has data', () => {
    const result = buildCategoryTrends({
      now: NOW,
      totals: [{ category: 'Groceries', month: '2026-08', total: 55 }],
      windowMonths: 12,
    });

    expect(result.hasEnoughHistory).toBe(false);
  });

  it('ignores totals outside the selected window', () => {
    const result = buildCategoryTrends({
      now: NOW,
      totals: [
        { category: 'Rent', month: '2026-01', total: 800 },
        { category: 'Groceries', month: '2026-08', total: 55 },
      ],
      windowMonths: 2,
    });

    expect(result.months).toEqual(['2026-07', '2026-08']);
    expect(result.trends.map((tile) => tile.category)).toEqual(['Groceries']);
  });
});
