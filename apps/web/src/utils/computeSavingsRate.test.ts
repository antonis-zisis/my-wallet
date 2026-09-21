import { describe, expect, it } from 'vitest';

import { computeSavingsRate } from './computeSavingsRate';

describe('computeSavingsRate', () => {
  it('returns the percentage of income left after expenses', () => {
    const rate = computeSavingsRate({ totalExpenses: 780, totalIncome: 3000 });

    expect(rate).toBe(74);
  });

  it('returns a negative rate when expenses exceed income', () => {
    const rate = computeSavingsRate({ totalExpenses: 3450, totalIncome: 3000 });

    expect(rate).toBe(-15);
  });

  it('returns null when there is no income to measure against', () => {
    expect(
      computeSavingsRate({ totalExpenses: 200, totalIncome: 0 })
    ).toBeNull();
  });
});
