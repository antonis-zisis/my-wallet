import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { type Transaction } from '../../types/transaction';
import { ReportSummary } from './ReportSummary';

const makeTransaction = (
  overrides: Partial<Transaction> & Pick<Transaction, 'type' | 'amount'>
): Transaction => ({
  id: crypto.randomUUID(),
  reportId: '1',
  description: 'Test',
  category: 'Other',
  date: '2026-01-15',
  createdAt: '2026-01-15T00:00:00Z',
  updatedAt: '2026-01-15T00:00:00Z',
  ...overrides,
});

describe('ReportSummary', () => {
  it('displays zero totals when there are no transactions', () => {
    render(<ReportSummary transactions={[]} />);
    expect(screen.getAllByText(/0,00 €/)).toHaveLength(3);
  });

  it('displays formatted total income', () => {
    const transactions = [
      makeTransaction({ type: 'INCOME', amount: 2500 }),
      makeTransaction({ type: 'INCOME', amount: 500 }),
      makeTransaction({ type: 'EXPENSE', amount: 1000 }),
    ];
    render(<ReportSummary transactions={transactions} />);
    // income=3000, expenses=1000, net=2000 — all three values are distinct
    expect(screen.getByText('Total Income')).toBeInTheDocument();
    expect(screen.getByText(/3\.000,00 €/)).toBeInTheDocument();
  });

  it('displays formatted total expenses', () => {
    const transactions = [
      makeTransaction({ type: 'INCOME', amount: 1000 }),
      makeTransaction({ type: 'EXPENSE', amount: 200 }),
      makeTransaction({ type: 'EXPENSE', amount: 150 }),
    ];
    render(<ReportSummary transactions={transactions} />);
    // income=1000, expenses=350, net=+650 — all three values are distinct
    expect(screen.getByText('Total Expenses')).toBeInTheDocument();
    expect(screen.getByText(/350,00 €/)).toBeInTheDocument();
  });

  it('displays a positive net balance with a + prefix', () => {
    const transactions = [
      makeTransaction({ type: 'INCOME', amount: 3000 }),
      makeTransaction({ type: 'EXPENSE', amount: 1000 }),
    ];
    render(<ReportSummary transactions={transactions} />);
    expect(screen.getByText(/^\+/)).toBeInTheDocument();
  });

  it('uses green styling for a positive net balance', () => {
    const transactions = [
      makeTransaction({ type: 'INCOME', amount: 3000 }),
      makeTransaction({ type: 'EXPENSE', amount: 1000 }),
    ];
    render(<ReportSummary transactions={transactions} />);
    expect(screen.getByText(/2\.000,00 €/)).toHaveClass('text-green-600');
  });

  it('uses red styling for a negative net balance', () => {
    const transactions = [
      makeTransaction({ type: 'INCOME', amount: 500 }),
      makeTransaction({ type: 'EXPENSE', amount: 1500 }),
    ];
    render(<ReportSummary transactions={transactions} />);
    // The net balance value: formatMoney(-1000) = 1.000,00 (abs value displayed)
    expect(screen.getByText(/-1\.000,00 €/)).toHaveClass('text-red-600');
  });
});
