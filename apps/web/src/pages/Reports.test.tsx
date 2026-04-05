import { MockLink } from '@apollo/client/testing';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { GET_REPORTS } from '../graphql/reports';
import { MockedProvider } from '../test/apollo-test-utils';
import { Reports } from './Reports';

const mockReportsQuery: MockLink.MockedResponse = {
  request: { query: GET_REPORTS, variables: { page: 1 } },
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
  request: { query: GET_REPORTS, variables: { page: 1 } },
  result: {
    errors: [new GraphQLError('Failed to load reports')],
  },
};

const mockPage1: MockLink.MockedResponse = {
  request: { query: GET_REPORTS, variables: { page: 1 } },
  result: {
    data: {
      reports: {
        items: Array.from({ length: 10 }, (_, index) => ({
          id: String(index + 1),
          title: `Report ${index + 1}`,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          transactions: [],
        })),
        totalCount: 15,
      },
    },
  },
};

const mockPage2: MockLink.MockedResponse = {
  request: { query: GET_REPORTS, variables: { page: 2 } },
  result: {
    data: {
      reports: {
        items: Array.from({ length: 5 }, (_, index) => ({
          id: String(index + 11),
          title: `Report ${index + 11}`,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          transactions: [],
        })),
        totalCount: 15,
      },
    },
  },
};

const renderReports = (mocks: Array<MockLink.MockedResponse>) => {
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
    expect(screen.getByTestId('report-list-skeleton')).toBeInTheDocument();
  });

  it('renders report list after loading', async () => {
    renderReports([mockReportsQuery]);
    expect(await screen.findByText('January Budget')).toBeInTheDocument();
    expect(screen.getByText('February Budget')).toBeInTheDocument();
  });

  it('shows item range and total count', async () => {
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

  describe('pagination', () => {
    it('disables Previous button on page 1', async () => {
      renderReports([mockPage1]);
      expect(await screen.findByText('Report 1')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Previous page' })
      ).toBeDisabled();
    });

    it('shows correct item range as the centre label', async () => {
      renderReports([mockPage1]);
      expect(
        await screen.findByText(/Showing 1 - 10 of 15/)
      ).toBeInTheDocument();
    });

    it('shows correct item range on page 1', async () => {
      renderReports([mockPage1]);
      expect(
        await screen.findByText(/Showing 1 - 10 of 15/)
      ).toBeInTheDocument();
    });

    it('navigates to page 2 and shows correct range', async () => {
      renderReports([mockPage1, mockPage2]);
      expect(await screen.findByText('Report 1')).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'Next page' }));

      expect(await screen.findByText('Report 11')).toBeInTheDocument();
      expect(screen.getByText(/Showing 11 - 15 of 15/)).toBeInTheDocument();
    });

    it('disables Next button on the last page', async () => {
      renderReports([mockPage1, mockPage2]);
      expect(await screen.findByText('Report 1')).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'Next page' }));

      expect(await screen.findByText('Report 11')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    });
  });
});
