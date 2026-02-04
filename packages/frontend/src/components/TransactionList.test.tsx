import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TransactionList from './TransactionList';
import { Transaction } from '../types/transaction';

describe('TransactionList', () => {
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      type: 'expense',
      amount: 50.0,
      description: 'Grocery shopping',
      category: 'Food',
      date: '2024-01-15',
    },
    {
      id: '2',
      type: 'income',
      amount: 1000.0,
      description: 'Monthly salary',
      category: 'Salary',
      date: '2024-01-01',
    },
    {
      id: '3',
      type: 'expense',
      amount: 25.5,
      description: 'Bus ticket',
      category: 'Transport',
      date: '2024-01-20',
    },
  ];

  it('renders empty state when no transactions', () => {
    render(<TransactionList transactions={[]} />);

    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(
      screen.getByText('No transactions yet. Add your first one above!')
    ).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<TransactionList transactions={mockTransactions} />);

    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
  });

  it('renders all transactions', () => {
    render(<TransactionList transactions={mockTransactions} />);

    expect(screen.getByText('Grocery shopping')).toBeInTheDocument();
    expect(screen.getByText('Monthly salary')).toBeInTheDocument();
    expect(screen.getByText('Bus ticket')).toBeInTheDocument();
  });

  it('displays transaction categories', () => {
    render(<TransactionList transactions={mockTransactions} />);

    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Salary')).toBeInTheDocument();
    expect(screen.getByText('Transport')).toBeInTheDocument();
  });

  it('formats amounts with sign and two decimal places', () => {
    render(<TransactionList transactions={mockTransactions} />);

    expect(screen.getByText('-$50.00')).toBeInTheDocument();
    expect(screen.getByText('+$1000.00')).toBeInTheDocument();
    expect(screen.getByText('-$25.50')).toBeInTheDocument();
  });

  it('displays type badges for income and expense', () => {
    render(<TransactionList transactions={mockTransactions} />);

    const incomeBadges = screen.getAllByText('Income');
    const expenseBadges = screen.getAllByText('Expense');

    expect(incomeBadges).toHaveLength(1);
    expect(expenseBadges).toHaveLength(2);
  });

  it('sorts transactions by date (newest first)', () => {
    render(<TransactionList transactions={mockTransactions} />);

    const rows = screen.getAllByRole('row');
    // First row is header, so start from index 1
    const descriptions = rows.slice(1).map((row) => {
      const cells = row.querySelectorAll('td');
      return cells[3].textContent; // Description is 4th column
    });

    expect(descriptions).toEqual([
      'Bus ticket', // Jan 20
      'Grocery shopping', // Jan 15
      'Monthly salary', // Jan 01
    ]);
  });

  it('applies green styling to income amounts', () => {
    render(<TransactionList transactions={mockTransactions} />);

    const incomeAmount = screen.getByText('+$1000.00');
    expect(incomeAmount).toHaveClass('text-green-600');
  });

  it('applies red styling to expense amounts', () => {
    render(<TransactionList transactions={mockTransactions} />);

    const expenseAmount = screen.getByText('-$50.00');
    expect(expenseAmount).toHaveClass('text-red-600');
  });

  it('applies green background to income type badge', () => {
    render(<TransactionList transactions={mockTransactions} />);

    const incomeBadge = screen.getByText('Income');
    expect(incomeBadge).toHaveClass('bg-green-100', 'text-green-700');
  });

  it('applies red background to expense type badge', () => {
    render(<TransactionList transactions={mockTransactions} />);

    const expenseBadges = screen.getAllByText('Expense');
    expenseBadges.forEach((badge) => {
      expect(badge).toHaveClass('bg-red-100', 'text-red-700');
    });
  });

  it('formats dates in readable format', () => {
    render(<TransactionList transactions={mockTransactions} />);

    // Dates should be formatted as "Jan 15, 2024" etc.
    expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument();
    expect(screen.getByText('Jan 1, 2024')).toBeInTheDocument();
    expect(screen.getByText('Jan 20, 2024')).toBeInTheDocument();
  });
});
