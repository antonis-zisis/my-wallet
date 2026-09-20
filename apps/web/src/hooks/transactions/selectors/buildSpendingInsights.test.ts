import { describe, expect, it } from 'vitest';

import { buildSpendingInsights } from './buildSpendingInsights';

const NOW = new Date('2026-09-20T00:00:00.000Z');

const BASELINE_MONTHS = [
  '2026-02',
  '2026-03',
  '2026-04',
  '2026-05',
  '2026-06',
  '2026-07',
];

function everyBaselineMonth(category: string, total: number) {
  return BASELINE_MONTHS.map((month) => ({ category, month, total }));
}

describe('buildSpendingInsights', () => {
  it('returns nothing when there are no totals', () => {
    const result = buildSpendingInsights({ now: NOW, totals: [] });

    expect(result.insights).toEqual([]);
    expect(result.month).toBeNull();
  });

  it('returns nothing when there are fewer than three baseline months', () => {
    const result = buildSpendingInsights({
      now: NOW,
      totals: [
        { category: 'Groceries', month: '2026-06', total: 400 },
        { category: 'Groceries', month: '2026-07', total: 400 },
        { category: 'Groceries', month: '2026-08', total: 900 },
      ],
    });

    expect(result.insights).toEqual([]);
    expect(result.month).toBeNull();
  });

  it('compares the last complete month, ignoring the current partial month', () => {
    const result = buildSpendingInsights({
      now: NOW,
      totals: [
        ...everyBaselineMonth('Household', 800),
        ...everyBaselineMonth('Dining & Takeaway', 180),
        { category: 'Household', month: '2026-08', total: 800 },
        { category: 'Dining & Takeaway', month: '2026-08', total: 310 },
        { category: 'Dining & Takeaway', month: '2026-09', total: 5000 },
      ],
    });

    expect(result.month).toBe('2026-08');
    expect(result.baselineMonthCount).toBe(6);
    expect(result.insights).toHaveLength(1);
    expect(result.insights[0]).toMatchObject({
      baselineAverage: 180,
      category: 'Dining & Takeaway',
      difference: 130,
      direction: 'INCREASE',
      total: 310,
    });
    expect(result.insights[0].percentageChange).toBeCloseTo(0.722, 3);
  });

  it('reports a category that dropped well below its average', () => {
    const result = buildSpendingInsights({
      now: NOW,
      totals: [
        ...everyBaselineMonth('Household', 800),
        ...everyBaselineMonth('Dining & Takeaway', 180),
        { category: 'Household', month: '2026-08', total: 800 },
        { category: 'Dining & Takeaway', month: '2026-08', total: 60 },
      ],
    });

    expect(result.insights[0]).toMatchObject({
      category: 'Dining & Takeaway',
      difference: -120,
      direction: 'DECREASE',
      total: 60,
    });
  });

  it('marks a category with no baseline spending as having no percentage', () => {
    const result = buildSpendingInsights({
      now: NOW,
      totals: [
        ...everyBaselineMonth('Household', 800),
        { category: 'Household', month: '2026-08', total: 800 },
        { category: 'Kids', month: '2026-08', total: 300 },
      ],
    });

    expect(result.insights[0]).toMatchObject({
      baselineAverage: 0,
      category: 'Kids',
      direction: 'INCREASE',
      percentageChange: null,
      total: 300,
    });
  });

  it('ignores a category that moved by less than the percentage threshold', () => {
    const result = buildSpendingInsights({
      now: NOW,
      totals: [
        ...everyBaselineMonth('Household', 800),
        ...everyBaselineMonth('Groceries', 400),
        { category: 'Household', month: '2026-08', total: 800 },
        { category: 'Groceries', month: '2026-08', total: 500 },
      ],
    });

    expect(result.insights).toEqual([]);
  });

  it('ignores a swing too small to matter against a typical month', () => {
    const result = buildSpendingInsights({
      now: NOW,
      totals: [
        ...everyBaselineMonth('Household', 800),
        ...everyBaselineMonth('Coffee', 4),
        { category: 'Household', month: '2026-08', total: 800 },
        { category: 'Coffee', month: '2026-08', total: 12 },
      ],
    });

    expect(result.insights).toEqual([]);
  });

  it('returns the three largest movements, ranked by amount rather than percentage', () => {
    const result = buildSpendingInsights({
      now: NOW,
      totals: [
        ...everyBaselineMonth('Household', 800),
        ...everyBaselineMonth('Dining & Takeaway', 100),
        ...everyBaselineMonth('Transport', 100),
        ...everyBaselineMonth('Shopping', 50),
        { category: 'Household', month: '2026-08', total: 1200 },
        { category: 'Dining & Takeaway', month: '2026-08', total: 250 },
        { category: 'Transport', month: '2026-08', total: 300 },
        { category: 'Shopping', month: '2026-08', total: 130 },
      ],
    });

    expect(result.insights.map((insight) => insight.category)).toEqual([
      'Household',
      'Transport',
      'Dining & Takeaway',
    ]);
  });

  it('stays silent when the month looks unlogged rather than frugal', () => {
    const result = buildSpendingInsights({
      now: NOW,
      totals: [
        ...everyBaselineMonth('Household', 800),
        { category: 'Groceries', month: '2026-08', total: 50 },
      ],
    });

    expect(result.insights).toEqual([]);
    expect(result.month).toBe('2026-08');
  });
});
