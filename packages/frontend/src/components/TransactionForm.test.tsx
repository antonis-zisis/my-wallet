import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider, MockedResponse } from '../test/apollo-test-utils';
import TransactionForm from './TransactionForm';
import { CREATE_TRANSACTION, GET_TRANSACTIONS } from '../graphql/operations';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../types/transaction';

const getTodayDate = () => new Date().toISOString().split('T')[0];

const createMockCreateTransaction = (
  variables: {
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    description: string;
    category: string;
  },
  options?: { delay?: number; error?: string }
): MockedResponse => {
  const base = {
    request: {
      query: CREATE_TRANSACTION,
      variables: {
        input: {
          ...variables,
          date: getTodayDate(),
        },
      },
    },
    ...(options?.delay && { delay: options.delay }),
  };

  if (options?.error) {
    return {
      ...base,
      error: new Error(options.error),
    };
  }

  return {
    ...base,
    result: {
      data: {
        createTransaction: {
          id: '123',
          ...variables,
          date: getTodayDate(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    },
  };
};

const mockGetTransactions: MockedResponse = {
  request: {
    query: GET_TRANSACTIONS,
  },
  result: {
    data: {
      transactions: [],
    },
  },
};

const renderWithApollo = (mocks: MockedResponse[] = []) => {
  return render(
    <MockedProvider mocks={[mockGetTransactions, ...mocks]} addTypename={false}>
      <TransactionForm />
    </MockedProvider>
  );
};

describe('TransactionForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the form with all fields', () => {
    renderWithApollo();

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
    renderWithApollo();

    const expenseButton = screen.getByRole('button', { name: 'Expense' });
    expect(expenseButton).toHaveClass('bg-red-500');
  });

  it('switches between income and expense types', async () => {
    const user = userEvent.setup();
    renderWithApollo();

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
    renderWithApollo();

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
    renderWithApollo();

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
    renderWithApollo();

    const categorySelect = screen.getByLabelText('Category');
    await user.selectOptions(categorySelect, 'Food');
    expect(categorySelect).toHaveValue('Food');

    await user.click(screen.getByRole('button', { name: 'Income' }));
    expect(categorySelect).toHaveValue('');
  });

  it('shows error when submitting without amount', async () => {
    const user = userEvent.setup();
    renderWithApollo();

    await user.click(screen.getByRole('button', { name: 'Add Transaction' }));

    expect(screen.getByText('Please enter a valid amount')).toBeInTheDocument();
  });

  it('shows error when submitting with zero amount', async () => {
    const user = userEvent.setup();
    renderWithApollo();

    await user.type(screen.getByLabelText('Amount'), '0');
    await user.click(screen.getByRole('button', { name: 'Add Transaction' }));

    expect(screen.getByText('Please enter a valid amount')).toBeInTheDocument();
  });

  it('shows error when submitting without description', async () => {
    const user = userEvent.setup();
    renderWithApollo();

    await user.type(screen.getByLabelText('Amount'), '100');
    await user.click(screen.getByRole('button', { name: 'Add Transaction' }));

    expect(screen.getByText('Please enter a description')).toBeInTheDocument();
  });

  it('shows error when submitting without category', async () => {
    const user = userEvent.setup();
    renderWithApollo();

    await user.type(screen.getByLabelText('Amount'), '100');
    await user.type(screen.getByLabelText('Description'), 'Test transaction');
    await user.click(screen.getByRole('button', { name: 'Add Transaction' }));

    expect(screen.getByText('Please select a category')).toBeInTheDocument();
  });

  it('submits the form successfully via GraphQL mutation', async () => {
    const user = userEvent.setup();
    const mock = createMockCreateTransaction({
      type: 'EXPENSE',
      amount: 50.25,
      description: 'Grocery shopping',
      category: 'Food',
    });
    renderWithApollo([mock]);

    await user.type(screen.getByLabelText('Amount'), '50.25');
    await user.type(screen.getByLabelText('Description'), 'Grocery shopping');
    await user.selectOptions(screen.getByLabelText('Category'), 'Food');
    await user.click(screen.getByRole('button', { name: 'Add Transaction' }));

    await waitFor(() => {
      expect(screen.getByLabelText('Amount')).toHaveValue(null);
    });
  });

  it('resets form after successful submission', async () => {
    const user = userEvent.setup();
    const mock = createMockCreateTransaction({
      type: 'EXPENSE',
      amount: 50.25,
      description: 'Grocery shopping',
      category: 'Food',
    });
    renderWithApollo([mock]);

    await user.type(screen.getByLabelText('Amount'), '50.25');
    await user.type(screen.getByLabelText('Description'), 'Grocery shopping');
    await user.selectOptions(screen.getByLabelText('Category'), 'Food');
    await user.click(screen.getByRole('button', { name: 'Add Transaction' }));

    await waitFor(() => {
      expect(screen.getByLabelText('Amount')).toHaveValue(null);
      expect(screen.getByLabelText('Description')).toHaveValue('');
      expect(screen.getByLabelText('Category')).toHaveValue('');
    });
  });

  it('shows error message when GraphQL mutation fails', async () => {
    const user = userEvent.setup();
    const mock = createMockCreateTransaction(
      {
        type: 'EXPENSE',
        amount: 100,
        description: 'Test',
        category: 'Food',
      },
      { error: 'Failed to create transaction' }
    );

    renderWithApollo([mock]);

    await user.type(screen.getByLabelText('Amount'), '100');
    await user.type(screen.getByLabelText('Description'), 'Test');
    await user.selectOptions(screen.getByLabelText('Category'), 'Food');
    await user.click(screen.getByRole('button', { name: 'Add Transaction' }));

    await waitFor(() => {
      expect(
        screen.getByText('Failed to create transaction')
      ).toBeInTheDocument();
    });
  });

  it('disables submit button while submitting', async () => {
    const user = userEvent.setup();
    const mock = createMockCreateTransaction(
      {
        type: 'EXPENSE',
        amount: 100,
        description: 'Test',
        category: 'Food',
      },
      { delay: 100 }
    );

    renderWithApollo([mock]);

    await user.type(screen.getByLabelText('Amount'), '100');
    await user.type(screen.getByLabelText('Description'), 'Test');
    await user.selectOptions(screen.getByLabelText('Category'), 'Food');
    await user.click(screen.getByRole('button', { name: 'Add Transaction' }));

    expect(screen.getByRole('button', { name: 'Adding...' })).toBeDisabled();

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Add Transaction' })
      ).not.toBeDisabled();
    });
  });
});
