import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Transaction } from '../../types/transaction';
import { TransactionTable } from './TransactionTable';

const mockTransactions: Transaction[] = [
  {
    id: '1',
    reportId: 'r1',
    type: 'INCOME',
    amount: 1500.0,
    description: 'Monthly salary',
    category: 'Salary',
    date: '2024-01-15T00:00:00.000Z',
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
  },
  {
    id: '2',
    reportId: 'r1',
    type: 'EXPENSE',
    amount: 42.5,
    description: 'Groceries',
    category: 'Food',
    date: '2024-01-16T00:00:00.000Z',
    createdAt: '2024-01-16T00:00:00.000Z',
    updatedAt: '2024-01-16T00:00:00.000Z',
  },
];

describe('TransactionTable', () => {
  it('shows empty state when no transactions', () => {
    render(<TransactionTable transactions={[]} />);
    expect(
      screen.getByText('No transactions yet. Add your first one!')
    ).toBeInTheDocument();
  });

  it('renders transaction rows', () => {
    render(<TransactionTable transactions={mockTransactions} />);
    expect(screen.getByText('Monthly salary')).toBeInTheDocument();
    expect(screen.getByText('Groceries')).toBeInTheDocument();
  });

  it('formats income amounts with + sign', () => {
    render(<TransactionTable transactions={mockTransactions} />);
    expect(screen.getByText('+1500.00 €')).toBeInTheDocument();
  });

  it('formats expense amounts with - sign', () => {
    render(<TransactionTable transactions={mockTransactions} />);
    expect(screen.getByText('-42.50 €')).toBeInTheDocument();
  });

  it('displays transaction categories', () => {
    render(<TransactionTable transactions={mockTransactions} />);
    expect(screen.getByText('Salary')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
  });

  it('shows type badges', () => {
    render(<TransactionTable transactions={mockTransactions} />);
    expect(screen.getByText('Income')).toBeInTheDocument();
    expect(screen.getByText('Expense')).toBeInTheDocument();
  });
});
