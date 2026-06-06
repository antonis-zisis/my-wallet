import { MockLink } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { describe, expect, it } from 'vitest';

import {
  CREATE_NET_WORTH_SNAPSHOT,
  DELETE_NET_WORTH_SNAPSHOT,
  GET_NET_WORTH_SNAPSHOTS,
  GET_NET_WORTH_TREND,
} from '../graphql/netWorth';
import {
  makeNetWorthEntry,
  makeNetWorthSnapshot,
} from '../test/fixtures/netWorth';
import { createWrapper } from '../test/hook-test-utils';
import { PAGE_SIZE, TREND_PAGE_SIZE, useNetWorthData } from './useNetWorthData';

const mockSnapshot = makeNetWorthSnapshot({
  id: '1',
  title: 'January 2026',
  totalAssets: 10000,
  totalLiabilities: 5000,
  netWorth: 5000,
  entries: [
    makeNetWorthEntry({ id: 'e1', label: 'Savings', amount: 10000 }),
    makeNetWorthEntry({
      id: 'e2',
      type: 'LIABILITY',
      label: 'Credit Card',
      amount: 5000,
      category: 'Credit Card',
    }),
  ],
});

const mockSnapshotsQuery: MockLink.MockedResponse = {
  request: {
    query: GET_NET_WORTH_SNAPSHOTS,
    variables: { page: 1, pageSize: PAGE_SIZE },
  },
  result: {
    data: {
      netWorthSnapshots: { items: [mockSnapshot], totalCount: 1 },
    },
  },
};

const mockSnapshotsQueryError: MockLink.MockedResponse = {
  request: {
    query: GET_NET_WORTH_SNAPSHOTS,
    variables: { page: 1, pageSize: PAGE_SIZE },
  },
  result: { errors: [new GraphQLError('Failed to load snapshots')] },
};

const mockTrendQuery: MockLink.MockedResponse = {
  request: {
    query: GET_NET_WORTH_TREND,
    variables: { pageSize: TREND_PAGE_SIZE },
  },
  result: {
    data: {
      netWorthSnapshots: { items: [], totalCount: 0 },
    },
  },
};

describe('useNetWorthData', () => {
  describe('initial state', () => {
    it('starts on page 1 with loading=true, empty snapshots, modal closed, no delete selection', () => {
      const { result } = renderHook(() => useNetWorthData(), {
        wrapper: createWrapper([mockTrendQuery, mockSnapshotsQuery]),
      });

      expect(result.current.page).toBe(1);
      expect(result.current.loading).toBe(true);
      expect(result.current.snapshots).toEqual([]);
      expect(result.current.modalState).toEqual({ kind: 'closed' });
      expect(result.current.snapshotToDelete).toBeNull();
    });
  });

  describe('data loading', () => {
    it('loads snapshots successfully', async () => {
      const { result } = renderHook(() => useNetWorthData(), {
        wrapper: createWrapper([mockTrendQuery, mockSnapshotsQuery]),
      });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.snapshots).toHaveLength(1);
      expect(result.current.snapshots[0].title).toBe('January 2026');
      expect(result.current.totalCount).toBe(1);
    });

    it('sets error to true on query failure', async () => {
      const { result } = renderHook(() => useNetWorthData(), {
        wrapper: createWrapper([mockTrendQuery, mockSnapshotsQueryError]),
      });

      await waitFor(() => expect(result.current.error).toBe(true));
    });
  });

  describe('pagination', () => {
    it('calculates totalPages from totalCount and PAGE_SIZE', async () => {
      const multiPageQuery: MockLink.MockedResponse = {
        request: {
          query: GET_NET_WORTH_SNAPSHOTS,
          variables: { page: 1, pageSize: PAGE_SIZE },
        },
        result: {
          data: {
            netWorthSnapshots: { items: [mockSnapshot], totalCount: 25 },
          },
        },
      };

      const { result } = renderHook(() => useNetWorthData(), {
        wrapper: createWrapper([mockTrendQuery, multiPageQuery]),
      });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.totalPages).toBe(3);
    });
  });

  describe('modal state', () => {
    it('round-trips through onOpenCreate → onCloseModal', () => {
      const { result } = renderHook(() => useNetWorthData(), {
        wrapper: createWrapper([mockTrendQuery, mockSnapshotsQuery]),
      });

      act(() => {
        result.current.onOpenCreate();
      });
      expect(result.current.modalState).toEqual({ kind: 'create' });

      act(() => {
        result.current.onCloseModal();
      });
      expect(result.current.modalState).toEqual({ kind: 'closed' });
    });

    it('opens the edit modal with the target snapshot', async () => {
      const { result } = renderHook(() => useNetWorthData(), {
        wrapper: createWrapper([mockTrendQuery, mockSnapshotsQuery]),
      });

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.onOpenEdit(mockSnapshot);
      });

      expect(result.current.modalState).toEqual({
        kind: 'edit',
        snapshot: mockSnapshot,
      });
    });
  });

  describe('mutations', () => {
    it('creates a snapshot, resets to page 1, and closes the modal', async () => {
      const createInput = {
        title: 'Test Snapshot',
        snapshotDate: '2026-02-01',
        entries: [
          {
            type: 'ASSET' as const,
            label: 'Savings',
            amount: 5000,
            category: 'Savings',
          },
        ],
      };

      const createMock: MockLink.MockedResponse = {
        request: {
          query: CREATE_NET_WORTH_SNAPSHOT,
          variables: { input: createInput },
        },
        result: {
          data: {
            createNetWorthSnapshot: {
              id: '2',
              title: 'Test Snapshot',
              snapshotDate: '2026-02-01T00:00:00.000Z',
              totalAssets: 5000,
              totalLiabilities: 0,
              netWorth: 5000,
              createdAt: '2026-02-01T00:00:00.000Z',
            },
          },
        },
      };

      const { result } = renderHook(() => useNetWorthData(), {
        wrapper: createWrapper([
          mockTrendQuery,
          mockTrendQuery,
          mockSnapshotsQuery,
          createMock,
          mockSnapshotsQuery,
        ]),
      });

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.onOpenCreate();
      });

      await act(async () => {
        await result.current.onModalSubmit(createInput);
      });

      expect(result.current.modalState).toEqual({ kind: 'closed' });
      expect(result.current.page).toBe(1);
    });

    it('deletes a snapshot and clears selection', async () => {
      const deleteMock: MockLink.MockedResponse = {
        request: {
          query: DELETE_NET_WORTH_SNAPSHOT,
          variables: { id: '1' },
        },
        result: { data: { deleteNetWorthSnapshot: true } },
      };

      const { result } = renderHook(() => useNetWorthData(), {
        wrapper: createWrapper([
          mockTrendQuery,
          mockTrendQuery,
          mockSnapshotsQuery,
          deleteMock,
          mockSnapshotsQuery,
        ]),
      });

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.onSelectForDelete(mockSnapshot);
      });

      await act(async () => {
        await result.current.onDeleteConfirm();
      });

      expect(result.current.snapshotToDelete).toBeNull();
    });
  });
});
