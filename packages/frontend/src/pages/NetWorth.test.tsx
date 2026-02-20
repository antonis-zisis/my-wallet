import { MockLink } from '@apollo/client/testing';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import {
  CREATE_NET_WORTH_SNAPSHOT,
  DELETE_NET_WORTH_SNAPSHOT,
  GET_NET_WORTH_SNAPSHOTS,
} from '../graphql/netWorth';
import { MockedProvider } from '../test/apollo-test-utils';
import { NetWorth } from './NetWorth';

const mockSnapshot = {
  id: '1',
  title: 'January 2026',
  totalAssets: 10000,
  totalLiabilities: 5000,
  netWorth: 5000,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const mockSnapshotsQuery: MockLink.MockedResponse = {
  request: { query: GET_NET_WORTH_SNAPSHOTS, variables: { page: 1 } },
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

const mockSnapshotsQueryError: MockLink.MockedResponse = {
  request: { query: GET_NET_WORTH_SNAPSHOTS, variables: { page: 1 } },
  result: {
    errors: [new GraphQLError('Failed to load snapshots')],
  },
};

const renderNetWorth = (mocks: Array<MockLink.MockedResponse>) => {
  return render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter>
        <NetWorth />
      </MemoryRouter>
    </MockedProvider>
  );
};

describe('NetWorth', () => {
  it('shows loading state initially', () => {
    renderNetWorth([mockSnapshotsQuery]);
    expect(screen.getByText('Loading snapshots...')).toBeInTheDocument();
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
    renderNetWorth([mockSnapshotsQueryEmpty]);
    expect(
      await screen.findByText('No snapshots yet. Create your first one!')
    ).toBeInTheDocument();
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
              totalAssets: 1000,
              totalLiabilities: 0,
              netWorth: 1000,
              createdAt: '2026-02-01T00:00:00.000Z',
            },
          },
        },
      };
      const refetchMock: MockLink.MockedResponse = {
        request: { query: GET_NET_WORTH_SNAPSHOTS, variables: { page: 1 } },
        result: {
          data: {
            netWorthSnapshots: {
              items: [mockSnapshot],
              totalCount: 1,
            },
          },
        },
      };

      renderNetWorth([mockSnapshotsQuery, createMock, refetchMock]);

      await userEvent.click(
        screen.getByRole('button', { name: 'New Snapshot' })
      );

      await userEvent.type(
        screen.getByPlaceholderText('e.g. February 2026'),
        'Test Snapshot'
      );
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

  describe('delete snapshot modal', () => {
    it('opens delete modal when delete button is clicked', async () => {
      renderNetWorth([mockSnapshotsQuery]);
      await screen.findByText('January 2026');

      await userEvent.click(
        screen.getByRole('button', { name: 'Delete January 2026' })
      );

      expect(screen.getByText('Delete Snapshot')).toBeInTheDocument();
      expect(
        screen.getByText(/Are you sure you want to delete/)
      ).toBeInTheDocument();
    });

    it('closes delete modal when Cancel is clicked', async () => {
      renderNetWorth([mockSnapshotsQuery]);
      await screen.findByText('January 2026');

      await userEvent.click(
        screen.getByRole('button', { name: 'Delete January 2026' })
      );
      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(screen.queryByText('Delete Snapshot')).not.toBeInTheDocument();
    });

    it('deletes snapshot on confirm and closes modal', async () => {
      const deleteMock: MockLink.MockedResponse = {
        request: {
          query: DELETE_NET_WORTH_SNAPSHOT,
          variables: { id: '1' },
        },
        result: { data: { deleteNetWorthSnapshot: true } },
      };
      const refetchMock: MockLink.MockedResponse = {
        request: {
          query: GET_NET_WORTH_SNAPSHOTS,
          variables: { page: 1 },
        },
        result: {
          data: {
            netWorthSnapshots: { items: [], totalCount: 0 },
          },
        },
      };

      renderNetWorth([mockSnapshotsQuery, deleteMock, refetchMock]);
      await screen.findByText('January 2026');

      await userEvent.click(
        screen.getByRole('button', { name: 'Delete January 2026' })
      );
      await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

      await waitFor(() => {
        expect(screen.queryByText('Delete Snapshot')).not.toBeInTheDocument();
      });
    });
  });
});
