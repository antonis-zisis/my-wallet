import { render } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { type Transaction } from '../../types/transaction';
import { ExpenseBreakdownChart } from './ExpenseBreakdownChart';

// PieChart with responsive prop uses ResizeObserver to get container dimensions
// before rendering SVG children. Mock it to immediately report a fixed size.
beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(private callback: ResizeObserverCallback) {}
      observe(target: Element) {
        this.callback(
          [
            {
              contentRect: { width: 800, height: 600 },
              target,
            } as ResizeObserverEntry,
          ],
          this as unknown as ResizeObserver
        );
      }
      unobserve() {}
      disconnect() {}
    }
  );
});

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

describe('ExpenseBreakdownChart', () => {
  it('renders nothing when there are no transactions', () => {
    const { container } = render(<ExpenseBreakdownChart transactions={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing when there are only income transactions', () => {
    const incomeOnly = [
      makeTransaction({ type: 'INCOME', category: 'Salary', amount: 3000 }),
    ];
    const { container } = render(
      <ExpenseBreakdownChart transactions={incomeOnly} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders a chart when expense transactions are provided', () => {
    const expenses = [
      makeTransaction({ category: 'Housing', amount: 1000 }),
      makeTransaction({ category: 'Food', amount: 300 }),
    ];
    const { container } = render(
      <ExpenseBreakdownChart transactions={expenses} />
    );
    expect(container.querySelector('.recharts-wrapper')).toBeInTheDocument();
  });

  it('renders one legend entry per unique category', () => {
    const expenses = [
      makeTransaction({ category: 'Food', amount: 100 }),
      makeTransaction({ category: 'Food', amount: 200 }),
      makeTransaction({ category: 'Housing', amount: 500 }),
    ];
    const { getAllByText } = render(
      <ExpenseBreakdownChart transactions={expenses} />
    );
    expect(getAllByText('Food')).toHaveLength(1);
    expect(getAllByText('Housing')).toHaveLength(1);
  });
});
