import { MockLink } from '@apollo/client/testing';
import { render, screen } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { GET_REPORT } from '../graphql/reports';
import { MockedProvider } from '../test/apollo-test-utils';
import { Report } from './Report';

const mockReportQuery: MockLink.MockedResponse = {
  request: {
    query: GET_REPORT,
    variables: { id: '1' },
  },
  result: {
    data: {
      report: {
        id: '1',
        title: 'January Budget',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        transactions: [
          {
            id: 't1',
            reportId: '1',
            type: 'INCOME',
            amount: 1500.0,
            description: 'Monthly salary',
            category: 'Salary',
            date: '2024-01-15T00:00:00.000Z',
            createdAt: '2024-01-15T00:00:00.000Z',
            updatedAt: '2024-01-15T00:00:00.000Z',
          },
        ],
      },
    },
  },
};

const mockReportQueryError: MockLink.MockedResponse = {
  request: {
    query: GET_REPORT,
    variables: { id: '1' },
  },
  result: {
    errors: [new GraphQLError('Failed to load report')],
  },
};

const renderReport = (mocks: MockLink.MockedResponse[]) => {
  return render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter initialEntries={['/reports/1']}>
        <Routes>
          <Route path="/reports/:id" element={<Report />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );
};

describe('Report', () => {
  it('shows loading state initially', () => {
    renderReport([mockReportQuery]);
    expect(screen.getByText('Loading report...')).toBeInTheDocument();
  });

  it('renders report data after loading', async () => {
    renderReport([mockReportQuery]);
    expect(await screen.findByText('January Budget')).toBeInTheDocument();
    expect(screen.getByText('Monthly salary')).toBeInTheDocument();
    expect(screen.getByText('+1500.00 €')).toBeInTheDocument();
  });

  it('shows error state on query failure', async () => {
    renderReport([mockReportQueryError]);
    expect(
      await screen.findByText('Failed to load report.')
    ).toBeInTheDocument();
  });

  it('shows back to reports link', async () => {
    renderReport([mockReportQuery]);
    const link = await screen.findByText('← Back to Reports');
    expect(link.closest('a')).toHaveAttribute('href', '/reports');
  });
});
