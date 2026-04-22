import { MockLink } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
import { MemoryRouter } from 'react-router-dom';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from '../contexts/ThemeContext';
import {
  CREATE_NET_WORTH_SNAPSHOT,
  GET_NET_WORTH_SNAPSHOTS,
  GET_NET_WORTH_TREND,
} from '../graphql/netWorth';
import { PAGE_SIZE, TREND_PAGE_SIZE } from '../hooks/useNetWorthData';
import { MockedProvider } from '../test/apollo-test-utils';
import { NetWorth } from './NetWorth';

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(private callback: ResizeObserverCallback) {}
      observe(target: Element) {
        this.callback(
          [
            {
              contentRect: { width: 800, height: 260 },
              target,
            } as ResizeObserverEntry,
          ],
          this as unknown as ResizeObserver
        );
      }
      unobserve() {}
      disconnect() {}
    }
  );
});

const mockSnapshot = {
  id: '1',
  title: 'January 2026',
  snapshotDate: '2026-01-01T00:00:00.000Z',
  totalAssets: 10000,
  totalLiabilities: 5000,
  netWorth: 5000,
  entries: [],
  createdAt: '2026-01-01T00:00:00.000Z',
};

const mockTrendQuery: MockLink.MockedResponse = {
  request: {
    query: GET_NET_WORTH_TREND,
    variables: { pageSize: TREND_PAGE_SIZE },
  },
  result: {
    data: {
      netWorthSnapshots: {
        items: [
          {
            id: mockSnapshot.id,
            title: mockSnapshot.title,
            snapshotDate: mockSnapshot.snapshotDate,
            totalAssets: mockSnapshot.totalAssets,
            totalLiabilities: mockSnapshot.totalLiabilities,
            netWorth: mockSnapshot.netWorth,
            createdAt: mockSnapshot.createdAt,
          },
        ],
        totalCount: 1,
      },
    },
  },
};

const mockTrendQueryEmpty: MockLink.MockedResponse = {
  request: {
    query: GET_NET_WORTH_TREND,
    variables: { pageSize: TREND_PAGE_SIZE },
  },
  result: {
    data: {
      netWorthSnapshots: {
        items: [],
        totalCount: 0,
      },
    },
  },
};

const mockTrendQueryWithChart: MockLink.MockedResponse = {
  request: {
    query: GET_NET_WORTH_TREND,
    variables: { pageSize: TREND_PAGE_SIZE },
  },
  result: {
    data: {
      netWorthSnapshots: {
        items: [
          {
            id: 'trend-1',
            title: 'January 2026',
            snapshotDate: '2026-01-01T00:00:00.000Z',
            totalAssets: 10000,
            totalLiabilities: 5000,
            netWorth: 5000,
            createdAt: '2026-01-01T00:00:00.000Z',
          },
          {
            id: 'trend-2',
            title: 'February 2026',
            snapshotDate: '2026-02-01T00:00:00.000Z',
            totalAssets: 12000,
            totalLiabilities: 4000,
            netWorth: 8000,
            createdAt: '2026-02-01T00:00:00.000Z',
          },
        ],
        totalCount: 2,
      },
    },
  },
};

const mockSnapshotsQuery: MockLink.MockedResponse = {
  request: {
    query: GET_NET_WORTH_SNAPSHOTS,
    variables: { page: 1, pageSize: PAGE_SIZE },
  },
  result: {
    data: {
      netWorthSnapshots: {
        items: [mockSnapshot],
        totalCount: 1,
      },
    },
  },
};

const mockSnapshotsQueryEmpty: MockLink.MockedResponse = {
  request: {
    query: GET_NET_WORTH_SNAPSHOTS,
    variables: { page: 1, pageSize: PAGE_SIZE },
  },
  result: {
    data: {
      netWorthSnapshots: {
        items: [],
        totalCount: 0,
      },
    },
  },
};

const mockSnapshotsQueryError: MockLink.MockedResponse = {
  request: {
    query: GET_NET_WORTH_SNAPSHOTS,
    variables: { page: 1, pageSize: PAGE_SIZE },
  },
  result: {
    errors: [new GraphQLError('Failed to load snapshots')],
  },
};

const renderNetWorth = (
  mocks: Array<MockLink.MockedResponse>,
  trendMock: MockLink.MockedResponse = mockTrendQuery
) => {
  return render(
    <MockedProvider mocks={[trendMock, ...mocks]}>
      <MemoryRouter>
        <ThemeProvider>
          <NetWorth />
        </ThemeProvider>
      </MemoryRouter>
    </MockedProvider>
  );
};

describe('NetWorth', () => {
  it('shows loading state initially', () => {
    renderNetWorth([mockSnapshotsQuery]);
    expect(screen.getByTestId('net-worth-list-skeleton')).toBeInTheDocument();
  });

  it('renders snapshot list after loading', async () => {
    renderNetWorth([mockSnapshotsQuery]);
    expect(await screen.findByText('January 2026')).toBeInTheDocument();
  });

  it('shows net worth value for each snapshot', async () => {
    renderNetWorth([mockSnapshotsQuery]);
    await screen.findByText('January 2026');
    expect(screen.getByText('+5.000,00 €')).toBeInTheDocument();
  });

  it('shows empty state when no snapshots exist', async () => {
    renderNetWorth([mockSnapshotsQueryEmpty], mockTrendQueryEmpty);
    expect(await screen.findByText('No snapshots yet')).toBeInTheDocument();
  });

  it('shows error state on query failure', async () => {
    renderNetWorth([mockSnapshotsQueryError]);
    expect(
      await screen.findByText('Failed to load snapshots.')
    ).toBeInTheDocument();
  });

  it('has New Snapshot button', () => {
    renderNetWorth([mockSnapshotsQuery]);
    expect(
      screen.getByRole('button', { name: 'New Snapshot' })
    ).toBeInTheDocument();
  });

  describe('create snapshot modal', () => {
    it('opens modal when New Snapshot is clicked', async () => {
      renderNetWorth([mockSnapshotsQuery]);
      await userEvent.click(
        screen.getByRole('button', { name: 'New Snapshot' })
      );
      expect(screen.getByText('New Net Worth Snapshot')).toBeInTheDocument();
    });

    it('closes modal when Cancel is clicked', async () => {
      renderNetWorth([mockSnapshotsQuery]);
      await userEvent.click(
        screen.getByRole('button', { name: 'New Snapshot' })
      );
      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(
        screen.queryByText('New Net Worth Snapshot')
      ).not.toBeInTheDocument();
    });

    it('Save Snapshot button is disabled when title is empty', async () => {
      renderNetWorth([mockSnapshotsQuery]);
      await userEvent.click(
        screen.getByRole('button', { name: 'New Snapshot' })
      );
      expect(
        screen.getByRole('button', { name: 'Save Snapshot' })
      ).toBeDisabled();
    });

    it('submits snapshot and closes modal', async () => {
      const createMock: MockLink.MockedResponse = {
        request: {
          query: CREATE_NET_WORTH_SNAPSHOT,
          variables: {
            input: {
              title: 'Test Snapshot',
              snapshotDate: '2026-04-15',
              entries: [
                {
                  type: 'ASSET',
                  label: 'Savings',
                  amount: 1000,
                  category: 'Savings',
                },
              ],
            },
          },
        },
        result: {
          data: {
            createNetWorthSnapshot: {
              id: '2',
              title: 'Test Snapshot',
              snapshotDate: '2026-04-15T00:00:00.000Z',
              totalAssets: 1000,
              totalLiabilities: 0,
              netWorth: 1000,
              createdAt: '2026-02-01T00:00:00.000Z',
            },
          },
        },
      };
      const refetchMock: MockLink.MockedResponse = {
        request: {
          query: GET_NET_WORTH_SNAPSHOTS,
          variables: { page: 1, pageSize: PAGE_SIZE },
        },
        result: {
          data: {
            netWorthSnapshots: {
              items: [mockSnapshot],
              totalCount: 1,
            },
          },
        },
      };

      renderNetWorth([
        mockSnapshotsQuery,
        createMock,
        refetchMock,
        mockTrendQuery,
      ]);

      await userEvent.click(
        screen.getByRole('button', { name: 'New Snapshot' })
      );

      await userEvent.type(
        screen.getByPlaceholderText('e.g. February 2026'),
        'Test Snapshot'
      );
      fireEvent.change(screen.getByLabelText('Snapshot Date'), {
        target: { value: '2026-04-15' },
      });
      await userEvent.type(screen.getByPlaceholderText('Label'), 'Savings');
      await userEvent.type(screen.getByPlaceholderText('Amount'), '1000');

      await userEvent.click(
        screen.getByRole('button', { name: 'Save Snapshot' })
      );

      await waitFor(() => {
        expect(
          screen.queryByText('New Net Worth Snapshot')
        ).not.toBeInTheDocument();
      });
      expect(screen.getByText('January 2026')).toBeInTheDocument();
    });
  });

  describe('trend chart', () => {
    it('shows the chart header when trend has 2+ snapshots', async () => {
      renderNetWorth([mockSnapshotsQuery], mockTrendQueryWithChart);
      expect(
        await screen.findByText('Net Worth Over Time')
      ).toBeInTheDocument();
    });

    it('collapses the chart when the toggle button is clicked', async () => {
      renderNetWorth([mockSnapshotsQuery], mockTrendQueryWithChart);
      await screen.findByText('Net Worth Over Time');

      const toggleButton = screen.getByRole('button', {
        name: 'Net Worth Over Time',
      });
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

      await userEvent.click(toggleButton);

      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('hides the view toggle when collapsed', async () => {
      renderNetWorth([mockSnapshotsQuery], mockTrendQueryWithChart);
      await screen.findByText('Net Worth Over Time');

      expect(
        screen.getByRole('button', { name: 'Assets & Liabilities' })
      ).toBeInTheDocument();

      await userEvent.click(
        screen.getByRole('button', { name: 'Net Worth Over Time' })
      );

      expect(
        screen.queryByRole('button', { name: 'Assets & Liabilities' })
      ).not.toBeInTheDocument();
    });

    it('switches to breakdown view when Assets & Liabilities is clicked', async () => {
      renderNetWorth([mockSnapshotsQuery], mockTrendQueryWithChart);
      await screen.findByText('Net Worth Over Time');

      await userEvent.click(
        screen.getByRole('button', { name: 'Assets & Liabilities' })
      );

      expect(await screen.findByText('Assets')).toBeInTheDocument();
      expect(screen.getByText('Liabilities')).toBeInTheDocument();
    });
  });
});
