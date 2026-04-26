import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ThemeProvider } from '../../contexts/ThemeContext';
import { type Transaction } from '../../types/transaction';
import {
  BudgetBreakdownChart,
  CATEGORY_TO_BUCKET,
} from './BudgetBreakdownChart';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

const makeTransaction = (
  overrides: Partial<Transaction> & Pick<Transaction, 'category' | 'amount'>
): Transaction => ({
  id: crypto.randomUUID(),
  reportId: '1',
  type: 'EXPENSE',
  description: 'Test',
  date: '2026-01-15',
  createdAt: '2026-01-15T00:00:00Z',
  updatedAt: '2026-01-15T00:00:00Z',
  ...overrides,
});

describe('BudgetBreakdownChart', () => {
  it('renders nothing when there are no expenses', () => {
    const { container } = render(<BudgetBreakdownChart transactions={[]} />, {
      wrapper,
    });
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing when there are only income transactions', () => {
    const incomeOnly = [
      makeTransaction({
        type: 'INCOME',
        category: 'Salary',
        amount: 3000,
      }),
    ];
    const { container } = render(
      <BudgetBreakdownChart transactions={incomeOnly} />,
      { wrapper }
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders a chart when expense transactions are provided', () => {
    const expenses = [
      makeTransaction({ category: 'Housing', amount: 1000 }),
      makeTransaction({ category: 'Entertainment', amount: 150 }),
      makeTransaction({ category: 'Investment', amount: 500 }),
    ];

    const { container } = render(
      <BudgetBreakdownChart transactions={expenses} />,
      { wrapper }
    );
    expect(container.querySelector('.recharts-wrapper')).toBeInTheDocument();
  });

  it('maps Needs categories correctly', () => {
    const needsCategories = [
      'Groceries',
      'Rent',
      'Transport',
      'Utilities',
      'Health',
      'Insurance',
      'Loan',
    ];
    for (const category of needsCategories) {
      expect(CATEGORY_TO_BUCKET[category]).toBe('Needs');
    }
  });

  it('maps Wants categories correctly', () => {
    const wantsCategories = [
      'Dining Out',
      'Entertainment',
      'Shopping',
      'Other',
    ];
    for (const category of wantsCategories) {
      expect(CATEGORY_TO_BUCKET[category]).toBe('Wants');
    }
  });

  it('maps Invest categories correctly', () => {
    expect(CATEGORY_TO_BUCKET['Investment']).toBe('Invest');
  });
});
