import { MockLink } from '@apollo/client/testing';
import { fireEvent, render, screen } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { ThemeProvider } from '../contexts/ThemeContext';
import { HEALTH_QUERY } from '../graphql/health';
import { GET_NET_WORTH_SNAPSHOTS } from '../graphql/netWorth';
import {
  GET_REPORT,
  GET_REPORTS,
  GET_REPORTS_SUMMARY,
} from '../graphql/reports';
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

const mockReportsOneItem: MockLink.MockedResponse = {
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
        ],
        totalCount: 1,
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

const mockReportsSummaryEmpty: MockLink.MockedResponse = {
  request: { query: GET_REPORTS_SUMMARY },
  result: {
    data: {
      reports: { items: [], totalCount: 0 },
    },
  },
};

const mockNetWorthSnapshotsEmpty: MockLink.MockedResponse = {
  request: { query: GET_NET_WORTH_SNAPSHOTS, variables: { page: 1 } },
  result: {
    data: {
      netWorthSnapshots: {
        items: [],
        totalCount: 0,
      },
    },
  },
};

const mockReportsSummaryWithItems: MockLink.MockedResponse = {
  request: { query: GET_REPORTS_SUMMARY },
  result: {
    data: {
      reports: {
        items: [
          {
            id: '1',
            title: 'February 2026',
            transactions: [{ type: 'INCOME', amount: 3000 }],
          },
          {
            id: '2',
            title: 'January 2026',
            transactions: [{ type: 'EXPENSE', amount: 200 }],
          },
        ],
        totalCount: 2,
      },
    },
  },
};

const renderHome = (mocks: Array<MockLink.MockedResponse>) => {
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
    renderHome([
      mockHealthQuery,
      mockReportsEmpty,
      mockReportsSummaryEmpty,
      mockNetWorthSnapshotsEmpty,
    ]);
    expect(screen.getByText('Connecting...')).toBeInTheDocument();
  });

  it('shows connected status after health query succeeds', async () => {
    renderHome([
      mockHealthQuery,
      mockReportsEmpty,
      mockReportsSummaryEmpty,
      mockNetWorthSnapshotsEmpty,
    ]);

    expect(
      await screen.findByText('GraphQL server is running!')
    ).toBeInTheDocument();
  });

  it('shows error status when health query fails', async () => {
    renderHome([
      mockHealthQueryError,
      mockReportsEmpty,
      mockReportsSummaryEmpty,
      mockNetWorthSnapshotsEmpty,
    ]);

    expect(
      await screen.findByText('Failed to connect to server')
    ).toBeInTheDocument();
  });

  it('displays total reports count', async () => {
    renderHome([
      mockHealthQuery,
      mockReportsWithItems,
      mockReportsSummaryWithItems,
      mockNetWorthSnapshotsEmpty,
    ]);

    expect(await screen.findByText('5')).toBeInTheDocument();
  });

  it('shows dash when reports data is not yet loaded', () => {
    renderHome([
      mockHealthQuery,
      mockReportsEmpty,
      mockReportsSummaryEmpty,
      mockNetWorthSnapshotsEmpty,
    ]);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('renders current and previous report cards', async () => {
    renderHome([
      mockHealthQuery,
      mockReportsWithItems,
      mockReportsSummaryWithItems,
      mockNetWorthSnapshotsEmpty,
      mockCurrentReport,
      mockPreviousReport,
    ]);

    expect(await screen.findByText('February 2026')).toBeInTheDocument();
    expect(await screen.findByText('January 2026')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
  });

  it('shows loading state for report cards before data arrives', () => {
    renderHome([
      mockHealthQuery,
      mockReportsWithItems,
      mockReportsSummaryWithItems,
      mockNetWorthSnapshotsEmpty,
    ]);

    expect(screen.queryByText('February 2026')).not.toBeInTheDocument();
    expect(screen.queryByText('January 2026')).not.toBeInTheDocument();
  });

  describe('placeholder cards', () => {
    it('shows placeholder cards for both slots when there are no reports', async () => {
      renderHome([
        mockHealthQuery,
        mockReportsEmpty,
        mockReportsSummaryEmpty,
        mockNetWorthSnapshotsEmpty,
      ]);

      // wait for GET_REPORTS to settle (totalCount changes from '-' to '0')
      expect(await screen.findByText('0')).toBeInTheDocument();

      const placeholders = screen.getAllByText('Add a report to view summary');
      expect(placeholders).toHaveLength(2);
      expect(screen.getByText('Current')).toBeInTheDocument();
      expect(screen.getByText('Previous')).toBeInTheDocument();
    });

    it('shows a placeholder for previous when only one report exists', async () => {
      renderHome([
        mockHealthQuery,
        mockReportsOneItem,
        mockReportsSummaryWithItems,
        mockNetWorthSnapshotsEmpty,
        mockCurrentReport,
      ]);

      // wait for the current report card to appear
      expect(await screen.findByText('February 2026')).toBeInTheDocument();

      expect(
        screen.getByText('Add a report to view summary')
      ).toBeInTheDocument();
      expect(screen.getByText('Previous')).toBeInTheDocument();
    });

    it('shows no placeholder cards when two reports exist', async () => {
      renderHome([
        mockHealthQuery,
        mockReportsWithItems,
        mockReportsSummaryWithItems,
        mockNetWorthSnapshotsEmpty,
        mockCurrentReport,
        mockPreviousReport,
      ]);

      expect(await screen.findByText('February 2026')).toBeInTheDocument();
      expect(await screen.findByText('January 2026')).toBeInTheDocument();
      expect(
        screen.queryByText('Add a report to view summary')
      ).not.toBeInTheDocument();
    });
  });

  describe('income & expenses chart', () => {
    it('renders the chart section when reports have data', async () => {
      renderHome([
        mockHealthQuery,
        mockReportsWithItems,
        mockReportsSummaryWithItems,
        mockNetWorthSnapshotsEmpty,
        mockCurrentReport,
        mockPreviousReport,
      ]);

      expect(await screen.findByText('Income & Expenses')).toBeInTheDocument();
    });

    it('does not render the chart section when no reports exist', async () => {
      renderHome([
        mockHealthQuery,
        mockReportsEmpty,
        mockReportsSummaryEmpty,
        mockNetWorthSnapshotsEmpty,
      ]);

      await screen.findByText('0');
      expect(screen.queryByText('Income & Expenses')).not.toBeInTheDocument();
    });

    it('collapses and reopens the chart on title button click', async () => {
      renderHome([
        mockHealthQuery,
        mockReportsWithItems,
        mockReportsSummaryWithItems,
        mockNetWorthSnapshotsEmpty,
        mockCurrentReport,
        mockPreviousReport,
      ]);

      const titleButton = await screen.findByRole('button', {
        name: /income & expenses/i,
      });

      // chart is open by default — clicking closes it
      fireEvent.click(titleButton);
      // limit buttons disappear when collapsed
      expect(
        screen.queryByRole('button', { name: '12' })
      ).not.toBeInTheDocument();

      // click again to reopen
      fireEvent.click(titleButton);
      expect(screen.getByText('Income & Expenses')).toBeInTheDocument();
    });

    it('shows limit control buttons when chart is open', async () => {
      renderHome([
        mockHealthQuery,
        mockReportsWithItems,
        mockReportsSummaryWithItems,
        mockNetWorthSnapshotsEmpty,
        mockCurrentReport,
        mockPreviousReport,
      ]);

      await screen.findByText('Income & Expenses');

      expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '6' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '9' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '12' })).toBeInTheDocument();
    });

    it('hides limit control buttons when chart is collapsed', async () => {
      renderHome([
        mockHealthQuery,
        mockReportsWithItems,
        mockReportsSummaryWithItems,
        mockNetWorthSnapshotsEmpty,
        mockCurrentReport,
        mockPreviousReport,
      ]);

      const titleButton = await screen.findByRole('button', {
        name: /income & expenses/i,
      });
      fireEvent.click(titleButton);

      expect(
        screen.queryByRole('button', { name: '3' })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: '12' })
      ).not.toBeInTheDocument();
    });

    it('updates the active limit when a limit button is clicked', async () => {
      renderHome([
        mockHealthQuery,
        mockReportsWithItems,
        mockReportsSummaryWithItems,
        mockNetWorthSnapshotsEmpty,
        mockCurrentReport,
        mockPreviousReport,
      ]);

      await screen.findByText('Income & Expenses');

      fireEvent.click(screen.getByRole('button', { name: '6' }));

      // the 6 button should now be active (blue) and 12 inactive
      expect(screen.getByRole('button', { name: '6' })).toHaveClass(
        'bg-blue-600'
      );
      expect(screen.getByRole('button', { name: '12' })).not.toHaveClass(
        'bg-blue-600'
      );
    });
  });

  describe('net worth card', () => {
    const mockNetWorthSnapshotsWithData: MockLink.MockedResponse = {
      request: { query: GET_NET_WORTH_SNAPSHOTS, variables: { page: 1 } },
      result: {
        data: {
          netWorthSnapshots: {
            items: [
              {
                id: 'nw1',
                title: 'February 2026',
                totalAssets: 15000,
                totalLiabilities: 3000,
                netWorth: 12000,
                createdAt: '2026-02-01T00:00:00.000Z',
                updatedAt: '2026-02-01T00:00:00.000Z',
              },
            ],
            totalCount: 1,
          },
        },
      },
    };

    it('shows the net worth card when a snapshot exists', async () => {
      renderHome([
        mockHealthQuery,
        mockReportsEmpty,
        mockReportsSummaryEmpty,
        mockNetWorthSnapshotsWithData,
      ]);

      expect(
        await screen.findByRole('heading', { name: 'Net Worth' })
      ).toBeInTheDocument();
    });

    it('shows the net worth value in the card header', async () => {
      renderHome([
        mockHealthQuery,
        mockReportsEmpty,
        mockReportsSummaryEmpty,
        mockNetWorthSnapshotsWithData,
      ]);

      await screen.findByRole('heading', { name: 'Net Worth' });
      // 12000 formatted with de-DE locale — appears in header span and expanded grid
      const headerValues = screen.getAllByText(/12\.000,00 €/);
      expect(headerValues.length).toBeGreaterThan(0);
    });

    it('shows the snapshot title when expanded', async () => {
      renderHome([
        mockHealthQuery,
        mockReportsEmpty,
        mockReportsSummaryEmpty,
        mockNetWorthSnapshotsWithData,
      ]);

      const headerButton = await screen.findByRole('button', {
        name: /net worth/i,
      });
      fireEvent.click(headerButton);

      expect(screen.getByText('February 2026')).toBeInTheDocument();
    });

    it('shows totalAssets, totalLiabilities, and netWorth values when expanded', async () => {
      renderHome([
        mockHealthQuery,
        mockReportsEmpty,
        mockReportsSummaryEmpty,
        mockNetWorthSnapshotsWithData,
      ]);

      const headerButton = await screen.findByRole('button', {
        name: /net worth/i,
      });
      fireEvent.click(headerButton);

      expect(screen.getByText('Assets')).toBeInTheDocument();
      expect(screen.getByText(/15\.000,00 €/)).toBeInTheDocument();
      expect(screen.getByText('Liabilities')).toBeInTheDocument();
      expect(screen.getByText(/3\.000,00 €/)).toBeInTheDocument();
    });

    it('does not render the card when no snapshots exist', async () => {
      renderHome([
        mockHealthQuery,
        mockReportsEmpty,
        mockReportsSummaryEmpty,
        mockNetWorthSnapshotsEmpty,
      ]);

      await screen.findByText('0');
      expect(screen.queryByText('Net Worth')).not.toBeInTheDocument();
    });

    it('card is collapsed by default', async () => {
      renderHome([
        mockHealthQuery,
        mockReportsEmpty,
        mockReportsSummaryEmpty,
        mockNetWorthSnapshotsWithData,
      ]);

      await screen.findByRole('heading', { name: 'Net Worth' });
      expect(screen.queryByText('Assets')).not.toBeInTheDocument();
    });

    it('expands on header button click', async () => {
      renderHome([
        mockHealthQuery,
        mockReportsEmpty,
        mockReportsSummaryEmpty,
        mockNetWorthSnapshotsWithData,
      ]);

      const headerButton = await screen.findByRole('button', {
        name: /net worth/i,
      });
      fireEvent.click(headerButton);

      expect(screen.getByText('Assets')).toBeInTheDocument();
    });

    it('collapses again on second click', async () => {
      renderHome([
        mockHealthQuery,
        mockReportsEmpty,
        mockReportsSummaryEmpty,
        mockNetWorthSnapshotsWithData,
      ]);

      const headerButton = await screen.findByRole('button', {
        name: /net worth/i,
      });
      fireEvent.click(headerButton);
      fireEvent.click(headerButton);

      expect(screen.queryByText('Assets')).not.toBeInTheDocument();
    });
  });
});
