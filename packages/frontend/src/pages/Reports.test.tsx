import { MockLink } from '@apollo/client/testing';
import { render, screen } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { GET_REPORTS } from '../graphql/reports';
import { MockedProvider } from '../test/apollo-test-utils';
import { Reports } from './Reports';

const mockReportsQuery: MockLink.MockedResponse = {
  request: { query: GET_REPORTS },
  result: {
    data: {
      reports: {
        items: [
          {
            id: '1',
            title: 'January Budget',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
          {
            id: '2',
            title: 'February Budget',
            createdAt: '2024-02-01T00:00:00.000Z',
            updatedAt: '2024-02-01T00:00:00.000Z',
          },
        ],
        totalCount: 2,
      },
    },
  },
};

const mockReportsQueryError: MockLink.MockedResponse = {
  request: { query: GET_REPORTS },
  result: {
    errors: [new GraphQLError('Failed to load reports')],
  },
};

const renderReports = (mocks: MockLink.MockedResponse[]) => {
  return render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter>
        <Reports />
      </MemoryRouter>
    </MockedProvider>
  );
};

describe('Reports', () => {
  it('shows loading state initially', () => {
    renderReports([mockReportsQuery]);
    expect(screen.getByText('Loading reports...')).toBeInTheDocument();
  });

  it('renders report list after loading', async () => {
    renderReports([mockReportsQuery]);
    expect(await screen.findByText('January Budget')).toBeInTheDocument();
    expect(screen.getByText('February Budget')).toBeInTheDocument();
  });

  it('shows total count', async () => {
    renderReports([mockReportsQuery]);
    expect(await screen.findByText(/Showing 1 - 2 of 2/)).toBeInTheDocument();
  });

  it('shows error state on query failure', async () => {
    renderReports([mockReportsQueryError]);
    expect(
      await screen.findByText('Failed to load reports.')
    ).toBeInTheDocument();
  });

  it('has Create Report button', () => {
    renderReports([mockReportsQuery]);
    expect(
      screen.getByRole('button', { name: 'Create Report' })
    ).toBeInTheDocument();
  });
});
