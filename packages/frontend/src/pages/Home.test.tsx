import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider, MockedResponse } from '../test/apollo-test-utils';
import { ThemeProvider } from '../contexts/ThemeContext';
import { Home } from './Home';
import { HEALTH_QUERY, GET_TRANSACTIONS } from '../graphql/operations';
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

const renderHome = (mocks: MockedResponse[]) => {
  return render(
    <ThemeProvider>
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </MockedProvider>
    </ThemeProvider>
  );
};

describe('Home', () => {
  it('shows connecting status initially', () => {
    renderHome([mockHealthQuery, mockGetTransactions]);
    expect(screen.getByText('Status: Connecting...')).toBeInTheDocument();
  });

  it('shows connected status after health query succeeds', async () => {
    renderHome([mockHealthQuery, mockGetTransactions]);

    expect(
      await screen.findByText('Status: GraphQL server is running!')
    ).toBeInTheDocument();
  });

  it('shows error status when health query fails', async () => {
    renderHome([mockHealthQueryError, mockGetTransactions]);

    expect(
      await screen.findByText('Status: Failed to connect to server')
    ).toBeInTheDocument();
  });

  it('renders TransactionForm', () => {
    renderHome([mockHealthQuery, mockGetTransactions]);
    expect(
      screen.getByRole('heading', { name: 'Add Transaction' })
    ).toBeInTheDocument();
  });

  it('renders TransactionList', () => {
    renderHome([mockHealthQuery, mockGetTransactions]);
    expect(
      screen.getByRole('heading', { name: 'Transactions' })
    ).toBeInTheDocument();
  });
});
