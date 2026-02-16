import { MockLink } from '@apollo/client/testing';
import { render, screen } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { ThemeProvider } from '../contexts/ThemeContext';
import { HEALTH_QUERY } from '../graphql/health';
import { GET_REPORT, GET_REPORTS } from '../graphql/reports';
import { MockedProvider } from '../test/apollo-test-utils';
import { Home } from './Home';

const mockHealthQuery: MockLink.MockedResponse = {
  request: {
    query: HEALTH_QUERY,
  },
  result: {
    data: {
      health: 'GraphQL server is running!',
    },
  },
};

const mockHealthQueryError: MockLink.MockedResponse = {
  request: {
    query: HEALTH_QUERY,
  },
  result: {
    errors: [new GraphQLError('Connection failed')],
  },
};

const mockReportsEmpty: MockLink.MockedResponse = {
  request: { query: GET_REPORTS },
  result: {
    data: {
      reports: { items: [], totalCount: 0 },
    },
  },
};

const mockReportsWithItems: MockLink.MockedResponse = {
  request: { query: GET_REPORTS },
  result: {
    data: {
      reports: {
        items: [
          {
            id: '1',
            title: 'February 2026',
            createdAt: '2026-02-01T00:00:00.000Z',
            updatedAt: '2026-02-01T00:00:00.000Z',
          },
          {
            id: '2',
            title: 'January 2026',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        ],
        totalCount: 5,
      },
    },
  },
};

const mockCurrentReport: MockLink.MockedResponse = {
  request: { query: GET_REPORT, variables: { id: '1' } },
  result: {
    data: {
      report: {
        id: '1',
        title: 'February 2026',
        createdAt: '2026-02-01T00:00:00.000Z',
        updatedAt: '2026-02-01T00:00:00.000Z',
        transactions: [
          {
            id: 't1',
            reportId: '1',
            type: 'INCOME',
            amount: 3000,
            description: 'Salary',
            category: 'Salary',
            date: '2026-02-05',
            createdAt: '2026-02-05T00:00:00.000Z',
            updatedAt: '2026-02-05T00:00:00.000Z',
          },
        ],
      },
    },
  },
};

const mockPreviousReport: MockLink.MockedResponse = {
  request: { query: GET_REPORT, variables: { id: '2' } },
  result: {
    data: {
      report: {
        id: '2',
        title: 'January 2026',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        transactions: [
          {
            id: 't2',
            reportId: '2',
            type: 'EXPENSE',
            amount: 200,
            description: 'Groceries',
            category: 'Food',
            date: '2026-01-10',
            createdAt: '2026-01-10T00:00:00.000Z',
            updatedAt: '2026-01-10T00:00:00.000Z',
          },
        ],
      },
    },
  },
};

const renderHome = (mocks: MockLink.MockedResponse[]) => {
  return render(
    <ThemeProvider>
      <MockedProvider mocks={mocks}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </MockedProvider>
    </ThemeProvider>
  );
};

describe('Home', () => {
  it('shows connecting status initially', () => {
    renderHome([mockHealthQuery, mockReportsEmpty]);
    expect(screen.getByText('Connecting...')).toBeInTheDocument();
  });

  it('shows connected status after health query succeeds', async () => {
    renderHome([mockHealthQuery, mockReportsEmpty]);

    expect(
      await screen.findByText('GraphQL server is running!')
    ).toBeInTheDocument();
  });

  it('shows error status when health query fails', async () => {
    renderHome([mockHealthQueryError, mockReportsEmpty]);

    expect(
      await screen.findByText('Failed to connect to server')
    ).toBeInTheDocument();
  });

  it('displays total reports count', async () => {
    renderHome([mockHealthQuery, mockReportsWithItems]);

    expect(await screen.findByText('5')).toBeInTheDocument();
  });

  it('shows dash when reports data is not yet loaded', () => {
    renderHome([mockHealthQuery, mockReportsEmpty]);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('renders current and previous report cards', async () => {
    renderHome([
      mockHealthQuery,
      mockReportsWithItems,
      mockCurrentReport,
      mockPreviousReport,
    ]);

    expect(await screen.findByText('February 2026')).toBeInTheDocument();
    expect(await screen.findByText('January 2026')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
  });

  it('shows loading state for report cards before data arrives', () => {
    renderHome([mockHealthQuery, mockReportsWithItems]);

    expect(screen.queryByText('February 2026')).not.toBeInTheDocument();
    expect(screen.queryByText('January 2026')).not.toBeInTheDocument();
  });
});
