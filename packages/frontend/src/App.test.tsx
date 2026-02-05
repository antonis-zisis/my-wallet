import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MockedProvider, MockedResponse } from './test/apollo-test-utils';
import App from './App';
import { HEALTH_QUERY, GET_TRANSACTIONS } from './graphql/operations';
import { GraphQLError } from 'graphql';

const mockHealthQuery: MockedResponse = {
  request: {
    query: HEALTH_QUERY,
  },
  result: {
    data: {
      health: 'GraphQL server is running!',
    },
  },
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

const mockHealthQueryError: MockedResponse = {
  request: {
    query: HEALTH_QUERY,
  },
  result: {
    errors: [new GraphQLError('Connection failed')],
  },
};

const renderWithApollo = (mocks: MockedResponse[]) => {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <App />
    </MockedProvider>
  );
};

describe('App', () => {
  it('renders the title', () => {
    renderWithApollo([mockHealthQuery, mockGetTransactions]);
    expect(screen.getByText('My Wallet')).toBeInTheDocument();
  });

  it('shows connecting status initially', () => {
    renderWithApollo([mockHealthQuery, mockGetTransactions]);
    expect(screen.getByText('Status: Connecting...')).toBeInTheDocument();
  });

  it('shows connected status after health query succeeds', async () => {
    renderWithApollo([mockHealthQuery, mockGetTransactions]);

    expect(
      await screen.findByText('Status: GraphQL server is running!')
    ).toBeInTheDocument();
  });

  it('shows error status when health query fails', async () => {
    renderWithApollo([mockHealthQueryError, mockGetTransactions]);

    expect(
      await screen.findByText('Status: Failed to connect to server')
    ).toBeInTheDocument();
  });

  it('renders TransactionForm', () => {
    renderWithApollo([mockHealthQuery, mockGetTransactions]);
    expect(
      screen.getByRole('heading', { name: 'Add Transaction' })
    ).toBeInTheDocument();
  });

  it('renders TransactionList', () => {
    renderWithApollo([mockHealthQuery, mockGetTransactions]);
    expect(
      screen.getByRole('heading', { name: 'Transactions' })
    ).toBeInTheDocument();
  });
});
