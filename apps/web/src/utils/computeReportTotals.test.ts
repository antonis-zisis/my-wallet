import { describe, expect, it } from 'vitest';

import { makeTransaction } from '../test/fixtures/report';
import { computeReportTotals } from './computeReportTotals';

describe('computeReportTotals', () => {
  it('sums income and expenses separately', () => {
    const totals = computeReportTotals([
      makeTransaction({ id: 't1', type: 'INCOME', amount: 2500 }),
      makeTransaction({ id: 't2', type: 'EXPENSE', amount: 150.5 }),
      makeTransaction({ id: 't3', type: 'EXPENSE', amount: 50 }),
    ]);

    expect(totals).toEqual({ totalExpenses: 200.5, totalIncome: 2500 });
  });

  it('returns zero totals when there are no transactions', () => {
    expect(computeReportTotals()).toEqual({
      totalExpenses: 0,
      totalIncome: 0,
    });
  });
});
