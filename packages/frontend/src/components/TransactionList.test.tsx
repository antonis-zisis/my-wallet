import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MockLink } from '@apollo/client/testing';
import { MockedProvider } from '../test/apollo-test-utils';
import TransactionList from './TransactionList';
import { GET_TRANSACTIONS } from '../graphql/operations';
import { GraphQLError } from 'graphql';

const mockTransactions = [
  {
    id: '1',
    type: 'EXPENSE',
    amount: 50.0,
    description: 'Grocery shopping',
    category: 'Food',
    date: '2024-01-15',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    type: 'INCOME',
    amount: 1000.0,
    description: 'Monthly salary',
    category: 'Salary',
    date: '2024-01-01',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    type: 'EXPENSE',
    amount: 25.5,
    description: 'Bus ticket',
    category: 'Transport',
    date: '2024-01-20',
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
  },
];

const mockGetTransactionsWithData: MockLink.MockedResponse = {
  request: {
    query: GET_TRANSACTIONS,
  },
  result: {
    data: {
      transactions: mockTransactions,
    },
  },
};

const mockGetTransactionsEmpty: MockLink.MockedResponse = {
  request: {
    query: GET_TRANSACTIONS,
  },
  result: {
    data: {
      transactions: [],
    },
  },
};

const mockGetTransactionsError: MockLink.MockedResponse = {
  request: {
    query: GET_TRANSACTIONS,
  },
  result: {
    errors: [new GraphQLError('Failed to fetch transactions')],
  },
};

const renderWithApollo = (mocks: MockLink.MockedResponse[]) => {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <TransactionList />
    </MockedProvider>
  );
};

describe('TransactionList', () => {
  it('shows loading state initially', () => {
    renderWithApollo([mockGetTransactionsWithData]);

    expect(screen.getByText('Loading transactions...')).toBeInTheDocument();
  });

  it('renders empty state when no transactions', async () => {
    renderWithApollo([mockGetTransactionsEmpty]);

    expect(
      await screen.findByText('No transactions yet. Add your first one above!')
    ).toBeInTheDocument();
  });

  it('renders error state when query fails', async () => {
    renderWithApollo([mockGetTransactionsError]);

    expect(
      await screen.findByText(/Failed to load transactions/)
    ).toBeInTheDocument();
  });

  it('renders table headers', async () => {
    renderWithApollo([mockGetTransactionsWithData]);

    expect(await screen.findByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
  });

  it('renders all transactions', async () => {
    renderWithApollo([mockGetTransactionsWithData]);

    expect(await screen.findByText('Grocery shopping')).toBeInTheDocument();
    expect(screen.getByText('Monthly salary')).toBeInTheDocument();
    expect(screen.getByText('Bus ticket')).toBeInTheDocument();
  });

  it('displays transaction categories', async () => {
    renderWithApollo([mockGetTransactionsWithData]);

    expect(await screen.findByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Salary')).toBeInTheDocument();
    expect(screen.getByText('Transport')).toBeInTheDocument();
  });

  it('formats amounts with sign and two decimal places', async () => {
    renderWithApollo([mockGetTransactionsWithData]);

    expect(await screen.findByText('-$50.00')).toBeInTheDocument();
    expect(screen.getByText('+$1000.00')).toBeInTheDocument();
    expect(screen.getByText('-$25.50')).toBeInTheDocument();
  });

  it('displays type badges for income and expense', async () => {
    renderWithApollo([mockGetTransactionsWithData]);

    await screen.findByText('Grocery shopping');

    const incomeBadges = screen.getAllByText('Income');
    const expenseBadges = screen.getAllByText('Expense');

    expect(incomeBadges).toHaveLength(1);
    expect(expenseBadges).toHaveLength(2);
  });

  it('sorts transactions by date (newest first)', async () => {
    renderWithApollo([mockGetTransactionsWithData]);

    await screen.findByText('Grocery shopping');

    const rows = screen.getAllByRole('row');
    const descriptions = rows.slice(1).map((row) => {
      const cells = row.querySelectorAll('td');
      return cells[3].textContent;
    });

    expect(descriptions).toEqual([
      'Bus ticket',
      'Grocery shopping',
      'Monthly salary',
    ]);
  });

  it('applies green styling to income amounts', async () => {
    renderWithApollo([mockGetTransactionsWithData]);

    const incomeAmount = await screen.findByText('+$1000.00');
    expect(incomeAmount).toHaveClass('text-green-600');
  });

  it('applies red styling to expense amounts', async () => {
    renderWithApollo([mockGetTransactionsWithData]);

    const expenseAmount = await screen.findByText('-$50.00');
    expect(expenseAmount).toHaveClass('text-red-600');
  });

  it('applies green background to income type badge', async () => {
    renderWithApollo([mockGetTransactionsWithData]);

    await screen.findByText('Grocery shopping');

    const incomeBadge = screen.getByText('Income');
    expect(incomeBadge).toHaveClass('bg-green-100', 'text-green-700');
  });

  it('applies red background to expense type badge', async () => {
    renderWithApollo([mockGetTransactionsWithData]);

    await screen.findByText('Grocery shopping');

    const expenseBadges = screen.getAllByText('Expense');
    expenseBadges.forEach((badge) => {
      expect(badge).toHaveClass('bg-red-100', 'text-red-700');
    });
  });

  it('formats dates in readable format', async () => {
    renderWithApollo([mockGetTransactionsWithData]);

    expect(await screen.findByText('Jan 15, 2024')).toBeInTheDocument();
    expect(screen.getByText('Jan 1, 2024')).toBeInTheDocument();
    expect(screen.getByText('Jan 20, 2024')).toBeInTheDocument();
  });
});
