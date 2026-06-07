import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { makeTransaction } from '../../test/fixtures/report';
import { ReportSummary } from './ReportSummary';

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

  it('displays a negative net balance with a minus prefix', () => {
    const transactions = [
      makeTransaction({ type: 'INCOME', amount: 500 }),
      makeTransaction({ type: 'EXPENSE', amount: 1500 }),
    ];
    render(<ReportSummary transactions={transactions} />);
    expect(screen.getByText(/-1\.000,00 €/)).toBeInTheDocument();
  });
});
