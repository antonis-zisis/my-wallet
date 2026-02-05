import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MockLink } from '@apollo/client/testing';
import { GraphQLError } from 'graphql';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '../test/apollo-test-utils';
import { ThemeProvider } from '../contexts/ThemeContext';
import { HEALTH_QUERY } from '../graphql/operations';
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

const renderHome = (mocks: MockLink.MockedResponse[]) => {
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
    renderHome([mockHealthQuery]);
    expect(screen.getByText('Status: Connecting...')).toBeInTheDocument();
  });

  it('shows connected status after health query succeeds', async () => {
    renderHome([mockHealthQuery]);

    expect(
      await screen.findByText('Status: GraphQL server is running!')
    ).toBeInTheDocument();
  });

  it('shows error status when health query fails', async () => {
    renderHome([mockHealthQueryError]);

    expect(
      await screen.findByText('Status: Failed to connect to server')
    ).toBeInTheDocument();
  });
});
