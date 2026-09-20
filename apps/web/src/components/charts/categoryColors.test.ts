import { describe, expect, it } from 'vitest';

import { EXPENSE_CATEGORIES } from '../../types/transaction';
import { CATEGORY_TO_BUCKET } from './BudgetBreakdownChart';
import { EXPENSE_CATEGORY_COLORS } from './categoryColors';

describe('EXPENSE_CATEGORY_COLORS', () => {
  it('covers every expense category', () => {
    const missing = EXPENSE_CATEGORIES.filter(
      (category) => !(category in EXPENSE_CATEGORY_COLORS)
    );

    expect(missing).toEqual([]);
  });

  it('has no colour left over from a retired category', () => {
    const stale = Object.keys(EXPENSE_CATEGORY_COLORS).filter(
      (category) => !EXPENSE_CATEGORIES.includes(category as never)
    );

    expect(stale).toEqual([]);
  });

  it('gives each category its own colour', () => {
    const colors = Object.values(EXPENSE_CATEGORY_COLORS);

    expect(new Set(colors).size).toBe(colors.length);
  });
});

describe('CATEGORY_TO_BUCKET', () => {
  it('buckets every expense category', () => {
    const missing = EXPENSE_CATEGORIES.filter(
      (category) => !(category in CATEGORY_TO_BUCKET)
    );

    expect(missing).toEqual([]);
  });

  it('has no bucket left over from a retired category', () => {
    const stale = Object.keys(CATEGORY_TO_BUCKET).filter(
      (category) => !EXPENSE_CATEGORIES.includes(category as never)
    );

    expect(stale).toEqual([]);
  });
});
