import { MockLink } from '@apollo/client/testing';
import { render, screen } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { ThemeProvider } from '../contexts/ThemeContext';
import { HEALTH_QUERY } from '../graphql/health';
import { GET_REPORTS } from '../graphql/reports';
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

const mockReportsQuery: MockLink.MockedResponse = {
  request: { query: GET_REPORTS },
  result: {
    data: {
      reports: { items: [], totalCount: 0 },
    },
  },
};

const renderHome = (mocks: MockLink.MockedResponse[]) => {
  return render(
    <ThemeProvider>
      <MockedProvider mocks={[...mocks, mockReportsQuery]}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </MockedProvider>
    </ThemeProvider>
  );
};

describe('Home', () => {
  it('shows connecting status initially', () => {
    renderHome([mockHealthQuery]);
    expect(screen.getByText('Connecting...')).toBeInTheDocument();
  });

  it('shows connected status after health query succeeds', async () => {
    renderHome([mockHealthQuery]);

    expect(
      await screen.findByText('GraphQL server is running!')
    ).toBeInTheDocument();
  });

  it('shows error status when health query fails', async () => {
    renderHome([mockHealthQueryError]);

    expect(
      await screen.findByText('Failed to connect to server')
    ).toBeInTheDocument();
  });
});
