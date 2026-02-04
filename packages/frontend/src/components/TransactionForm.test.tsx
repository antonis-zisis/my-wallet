import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransactionForm from './TransactionForm';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../types/transaction';

describe('TransactionForm', () => {
  const mockOnTransactionAdded = vi.fn();

  beforeEach(() => {
    mockOnTransactionAdded.mockClear();
    vi.restoreAllMocks();
  });

  it('renders the form with all fields', () => {
    render(<TransactionForm onTransactionAdded={mockOnTransactionAdded} />);

    expect(
      screen.getByRole('heading', { name: 'Add Transaction' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Income' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expense' })).toBeInTheDocument();
    expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add Transaction' })
    ).toBeInTheDocument();
  });

  it('defaults to expense type', () => {
    render(<TransactionForm onTransactionAdded={mockOnTransactionAdded} />);

    const expenseButton = screen.getByRole('button', { name: 'Expense' });
    expect(expenseButton).toHaveClass('bg-red-500');
  });

  it('switches between income and expense types', async () => {
    const user = userEvent.setup();
    render(<TransactionForm onTransactionAdded={mockOnTransactionAdded} />);

    const incomeButton = screen.getByRole('button', { name: 'Income' });
    const expenseButton = screen.getByRole('button', { name: 'Expense' });

    await user.click(incomeButton);
    expect(incomeButton).toHaveClass('bg-green-500');
    expect(expenseButton).not.toHaveClass('bg-red-500');

    await user.click(expenseButton);
    expect(expenseButton).toHaveClass('bg-red-500');
    expect(incomeButton).not.toHaveClass('bg-green-500');
  });

  it('shows expense categories by default', () => {
    render(<TransactionForm onTransactionAdded={mockOnTransactionAdded} />);

    const categorySelect = screen.getByLabelText(
      'Category'
    ) as HTMLSelectElement;
    const options = Array.from(categorySelect.options).map(
      (option) => option.value
    );

    EXPENSE_CATEGORIES.forEach((category) => {
      expect(options).toContain(category);
    });
  });

  it('shows income categories when income type is selected', async () => {
    const user = userEvent.setup();
    render(<TransactionForm onTransactionAdded={mockOnTransactionAdded} />);

    await user.click(screen.getByRole('button', { name: 'Income' }));

    const categorySelect = screen.getByLabelText(
      'Category'
    ) as HTMLSelectElement;
    const options = Array.from(categorySelect.options).map(
      (option) => option.value
    );

    INCOME_CATEGORIES.forEach((category) => {
      expect(options).toContain(category);
    });
  });

  it('resets category when switching types', async () => {
    const user = userEvent.setup();
    render(<TransactionForm onTransactionAdded={mockOnTransactionAdded} />);

    const categorySelect = screen.getByLabelText('Category');
    await user.selectOptions(categorySelect, 'Food');
    expect(categorySelect).toHaveValue('Food');

    await user.click(screen.getByRole('button', { name: 'Income' }));
    expect(categorySelect).toHaveValue('');
  });

  it('shows error when submitting without amount', async () => {
    const user = userEvent.setup();
    render(<TransactionForm onTransactionAdded={mockOnTransactionAdded} />);

    await user.click(screen.getByRole('button', { name: 'Add Transaction' }));

    expect(screen.getByText('Please enter a valid amount')).toBeInTheDocument();
    expect(mockOnTransactionAdded).not.toHaveBeenCalled();
  });

  it('shows error when submitting with zero amount', async () => {
    const user = userEvent.setup();
    render(<TransactionForm onTransactionAdded={mockOnTransactionAdded} />);

    await user.type(screen.getByLabelText('Amount'), '0');
    await user.click(screen.getByRole('button', { name: 'Add Transaction' }));

    expect(screen.getByText('Please enter a valid amount')).toBeInTheDocument();
  });

  it('shows error when submitting without description', async () => {
    const user = userEvent.setup();
    render(<TransactionForm onTransactionAdded={mockOnTransactionAdded} />);

    await user.type(screen.getByLabelText('Amount'), '100');
    await user.click(screen.getByRole('button', { name: 'Add Transaction' }));

    expect(screen.getByText('Please enter a description')).toBeInTheDocument();
  });

  it('shows error when submitting without category', async () => {
    const user = userEvent.setup();
    render(<TransactionForm onTransactionAdded={mockOnTransactionAdded} />);

    await user.type(screen.getByLabelText('Amount'), '100');
    await user.type(screen.getByLabelText('Description'), 'Test transaction');
    await user.click(screen.getByRole('button', { name: 'Add Transaction' }));

    expect(screen.getByText('Please select a category')).toBeInTheDocument();
  });

  it('submits the form successfully and calls onTransactionAdded', async () => {
    const user = userEvent.setup();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    render(<TransactionForm onTransactionAdded={mockOnTransactionAdded} />);

    await user.type(screen.getByLabelText('Amount'), '50.25');
    await user.type(screen.getByLabelText('Description'), 'Grocery shopping');
    await user.selectOptions(screen.getByLabelText('Category'), 'Food');
    await user.click(screen.getByRole('button', { name: 'Add Transaction' }));

    await waitFor(() => {
      expect(mockOnTransactionAdded).toHaveBeenCalledTimes(1);
    });

    const addedTransaction = mockOnTransactionAdded.mock.calls[0][0];
    expect(addedTransaction).toMatchObject({
      type: 'expense',
      amount: 50.25,
      description: 'Grocery shopping',
      category: 'Food',
    });
    expect(addedTransaction.id).toBeDefined();
  });

  it('resets form after successful submission', async () => {
    const user = userEvent.setup();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    render(<TransactionForm onTransactionAdded={mockOnTransactionAdded} />);

    await user.type(screen.getByLabelText('Amount'), '100');
    await user.type(screen.getByLabelText('Description'), 'Test');
    await user.selectOptions(screen.getByLabelText('Category'), 'Food');
    await user.click(screen.getByRole('button', { name: 'Add Transaction' }));

    await waitFor(() => {
      expect(screen.getByLabelText('Amount')).toHaveValue(null);
      expect(screen.getByLabelText('Description')).toHaveValue('');
      expect(screen.getByLabelText('Category')).toHaveValue('');
    });
  });

  it('shows error message when API call fails', async () => {
    const user = userEvent.setup();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
    });

    render(<TransactionForm onTransactionAdded={mockOnTransactionAdded} />);

    await user.type(screen.getByLabelText('Amount'), '100');
    await user.type(screen.getByLabelText('Description'), 'Test');
    await user.selectOptions(screen.getByLabelText('Category'), 'Food');
    await user.click(screen.getByRole('button', { name: 'Add Transaction' }));

    await waitFor(() => {
      expect(
        screen.getByText('Failed to save transaction. Please try again.')
      ).toBeInTheDocument();
    });

    expect(mockOnTransactionAdded).not.toHaveBeenCalled();
  });

  it('disables submit button while submitting', async () => {
    const user = userEvent.setup();
    let resolvePromise: (value: unknown) => void;
    globalThis.fetch = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
    );

    render(<TransactionForm onTransactionAdded={mockOnTransactionAdded} />);

    await user.type(screen.getByLabelText('Amount'), '100');
    await user.type(screen.getByLabelText('Description'), 'Test');
    await user.selectOptions(screen.getByLabelText('Category'), 'Food');
    await user.click(screen.getByRole('button', { name: 'Add Transaction' }));

    expect(screen.getByRole('button', { name: 'Adding...' })).toBeDisabled();

    resolvePromise!({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Add Transaction' })
      ).not.toBeDisabled();
    });
  });
});
