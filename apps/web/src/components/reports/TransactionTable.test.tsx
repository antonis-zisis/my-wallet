import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Transaction } from '../../types/transaction';
import { TransactionTable } from './TransactionTable';

const mockTransactions: Array<Transaction> = [
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
    expect(screen.getByText('No transactions yet')).toBeInTheDocument();
  });

  it('shows add transaction button in empty state when onAddTransaction is provided', async () => {
    const onAddTransaction = vi.fn();
    render(
      <TransactionTable transactions={[]} onAddTransaction={onAddTransaction} />
    );

    const button = screen.getByRole('button', { name: /add transaction/i });
    expect(button).toBeInTheDocument();

    await userEvent.click(button);
    expect(onAddTransaction).toHaveBeenCalledOnce();
  });

  it('does not show add transaction button in empty state when onAddTransaction is not provided', () => {
    render(<TransactionTable transactions={[]} />);
    expect(
      screen.queryByRole('button', { name: /add transaction/i })
    ).not.toBeInTheDocument();
  });

  it('renders transaction rows', () => {
    render(<TransactionTable transactions={mockTransactions} />);
    expect(screen.getByText('Monthly salary')).toBeInTheDocument();
    expect(screen.getByText('Groceries')).toBeInTheDocument();
  });

  it('formats income amounts with + sign', () => {
    render(<TransactionTable transactions={mockTransactions} />);
    expect(screen.getByText('+1.500,00 €')).toBeInTheDocument();
  });

  it('formats expense amounts with - sign', () => {
    render(<TransactionTable transactions={mockTransactions} />);
    expect(screen.getByText('-42,50 €')).toBeInTheDocument();
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

  it('renders dropdown menu trigger in each row', () => {
    render(<TransactionTable transactions={mockTransactions} />);
    const buttons = screen.getAllByLabelText('Options');
    expect(buttons).toHaveLength(2);
  });

  it('shows filtered empty state when filters are active and no transactions match', () => {
    render(
      <TransactionTable
        transactions={[]}
        selectedTypeFilter="Expense"
        selectedCategoryFilter="Groceries"
      />
    );
    expect(
      screen.getByText('No transactions match the selected filters')
    ).toBeInTheDocument();
  });

  describe('type filter', () => {
    it('does not show type filter when only one type is present', () => {
      render(
        <TransactionTable
          transactions={mockTransactions}
          presentExpenseCategories={[]}
          presentIncomeCategories={['Salary']}
        />
      );
      const typeHeader = screen.getByRole('columnheader', { name: /^type$/i });
      expect(within(typeHeader).queryByRole('button')).not.toBeInTheDocument();
    });

    it('shows type filter when both income and expense transactions are present', () => {
      render(
        <TransactionTable
          transactions={mockTransactions}
          presentExpenseCategories={['Groceries']}
          presentIncomeCategories={['Salary']}
        />
      );
      const typeHeader = screen.getByRole('columnheader', { name: /type/i });
      expect(within(typeHeader).getByRole('button')).toBeInTheDocument();
    });

    it('calls onSelectTypeFilter when a type filter option is clicked', async () => {
      const onSelectTypeFilter = vi.fn();
      render(
        <TransactionTable
          transactions={mockTransactions}
          presentExpenseCategories={['Groceries']}
          presentIncomeCategories={['Salary']}
          onSelectTypeFilter={onSelectTypeFilter}
        />
      );

      const typeHeader = screen.getByRole('columnheader', { name: /type/i });
      await userEvent.click(within(typeHeader).getByRole('button'));
      await userEvent.click(screen.getByRole('button', { name: 'Income' }));

      expect(onSelectTypeFilter).toHaveBeenCalledWith('Income');
    });
  });

  describe('category filter', () => {
    it('shows category filter when presentExpenseCategories has entries', () => {
      render(
        <TransactionTable
          transactions={mockTransactions}
          presentExpenseCategories={['Groceries']}
        />
      );
      const categoryHeader = screen.getByRole('columnheader', {
        name: /category/i,
      });
      expect(within(categoryHeader).getByRole('button')).toBeInTheDocument();
    });

    it('does not show category filter when no categories are present', () => {
      render(
        <TransactionTable
          transactions={mockTransactions}
          presentExpenseCategories={[]}
          presentIncomeCategories={[]}
        />
      );
      const categoryHeader = screen.getByRole('columnheader', {
        name: /category/i,
      });
      expect(
        within(categoryHeader).queryByRole('button')
      ).not.toBeInTheDocument();
    });

    it('shows income categories when selectedTypeFilter is Income', async () => {
      render(
        <TransactionTable
          transactions={mockTransactions}
          presentExpenseCategories={['Groceries']}
          presentIncomeCategories={['Salary']}
          selectedTypeFilter="Income"
        />
      );

      const categoryHeader = screen.getByRole('columnheader', {
        name: /category/i,
      });
      await userEvent.click(within(categoryHeader).getByRole('button'));

      expect(
        screen.getByRole('button', { name: 'Salary' })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Groceries' })
      ).not.toBeInTheDocument();
    });

    it('shows expense categories when selectedTypeFilter is Expense', async () => {
      render(
        <TransactionTable
          transactions={mockTransactions}
          presentExpenseCategories={['Groceries']}
          presentIncomeCategories={['Salary']}
          selectedTypeFilter="Expense"
        />
      );

      const categoryHeader = screen.getByRole('columnheader', {
        name: /category/i,
      });
      await userEvent.click(within(categoryHeader).getByRole('button'));

      expect(
        screen.getByRole('button', { name: 'Groceries' })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Salary' })
      ).not.toBeInTheDocument();
    });

    it('calls onSelectCategoryFilter when a category option is clicked', async () => {
      const onSelectCategoryFilter = vi.fn();
      render(
        <TransactionTable
          transactions={mockTransactions}
          presentExpenseCategories={['Groceries']}
          onSelectCategoryFilter={onSelectCategoryFilter}
        />
      );

      const categoryHeader = screen.getByRole('columnheader', {
        name: /category/i,
      });
      await userEvent.click(within(categoryHeader).getByRole('button'));
      await userEvent.click(screen.getByRole('button', { name: 'Groceries' }));

      expect(onSelectCategoryFilter).toHaveBeenCalledWith('Groceries');
    });
  });

  it('calls onEdit with the correct transaction when Edit is clicked', async () => {
    const onEdit = vi.fn();
    render(
      <TransactionTable transactions={mockTransactions} onEdit={onEdit} />
    );

    const buttons = screen.getAllByLabelText('Options');
    await userEvent.click(buttons[0]);
    await userEvent.click(screen.getByText('Edit'));

    expect(onEdit).toHaveBeenCalledWith(mockTransactions[0]);
  });

  it('calls onDelete with the correct transaction when Delete is clicked', async () => {
    const onDelete = vi.fn();
    render(
      <TransactionTable transactions={mockTransactions} onDelete={onDelete} />
    );

    const buttons = screen.getAllByLabelText('Options');
    await userEvent.click(buttons[1]);
    await userEvent.click(screen.getByText('Delete'));

    expect(onDelete).toHaveBeenCalledWith(mockTransactions[1]);
  });
});
