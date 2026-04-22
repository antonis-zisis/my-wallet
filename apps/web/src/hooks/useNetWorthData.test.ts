import { MockLink } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { describe, expect, it } from 'vitest';

import {
  CREATE_NET_WORTH_SNAPSHOT,
  DELETE_NET_WORTH_SNAPSHOT,
  GET_NET_WORTH_SNAPSHOTS,
  UPDATE_NET_WORTH_SNAPSHOT,
} from '../graphql/netWorth';
import { createWrapper } from '../test/hook-test-utils';
import { NetWorthSnapshot } from '../types/netWorth';
import { PAGE_SIZE, useNetWorthData } from './useNetWorthData';

const mockSnapshot: NetWorthSnapshot = {
  id: '1',
  title: 'January 2026',
  totalAssets: 10000,
  totalLiabilities: 5000,
  netWorth: 5000,
  entries: [
    {
      id: 'e1',
      type: 'ASSET',
      label: 'Savings',
      amount: 10000,
      category: 'Savings',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'e2',
      type: 'LIABILITY',
      label: 'Credit Card',
      amount: 5000,
      category: 'Credit Card',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const mockSecondSnapshot: NetWorthSnapshot = {
  ...mockSnapshot,
  id: '2',
  title: 'February 2026',
  totalAssets: 12000,
  totalLiabilities: 4000,
  netWorth: 8000,
  entries: [],
  createdAt: '2026-02-01T00:00:00.000Z',
  updatedAt: '2026-02-01T00:00:00.000Z',
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
      netWorthSnapshots: { items: [], totalCount: 0 },
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

describe('useNetWorthData', () => {
  describe('initial state', () => {
    it('starts on page 1 with loading state', () => {
      const { result } = renderHook(() => useNetWorthData(), {
        wrapper: createWrapper([mockSnapshotsQuery]),
      });

      expect(result.current.page).toBe(1);
      expect(result.current.loading).toBe(true);
      expect(result.current.snapshots).toEqual([]);
    });

    it('modal is closed and delete selection is null initially', () => {
      const { result } = renderHook(() => useNetWorthData(), {
        wrapper: createWrapper([mockSnapshotsQuery]),
      });

      expect(result.current.modalState).toEqual({ kind: 'closed' });
      expect(result.current.snapshotToDelete).toBeNull();
    });
  });

  describe('data loading', () => {
    it('loads snapshots successfully', async () => {
      const { result } = renderHook(() => useNetWorthData(), {
        wrapper: createWrapper([mockSnapshotsQuery]),
      });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.snapshots).toHaveLength(1);
      expect(result.current.snapshots[0].title).toBe('January 2026');
      expect(result.current.totalCount).toBe(1);
    });

    it('returns empty snapshots when there are none', async () => {
      const { result } = renderHook(() => useNetWorthData(), {
        wrapper: createWrapper([mockSnapshotsQueryEmpty]),
      });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.snapshots).toHaveLength(0);
      expect(result.current.totalCount).toBe(0);
    });

    it('sets error to true on query failure', async () => {
      const { result } = renderHook(() => useNetWorthData(), {
        wrapper: createWrapper([mockSnapshotsQueryError]),
      });

      await waitFor(() => expect(result.current.error).toBe(true));
    });
  });

  describe('pagination', () => {
    it('calculates totalPages correctly', async () => {
      const multiPageQuery: MockLink.MockedResponse = {
        request: {
          query: GET_NET_WORTH_SNAPSHOTS,
          variables: { page: 1, pageSize: PAGE_SIZE },
        },
        result: {
          data: {
            netWorthSnapshots: {
              items: [mockSnapshot],
              totalCount: 25,
            },
          },
        },
      };

      const { result } = renderHook(() => useNetWorthData(), {
        wrapper: createWrapper([multiPageQuery]),
      });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.totalPages).toBe(3);
    });

    it('changes page when onPageChange is called', async () => {
      const page2Query: MockLink.MockedResponse = {
        request: {
          query: GET_NET_WORTH_SNAPSHOTS,
          variables: { page: 2, pageSize: PAGE_SIZE },
        },
        result: {
          data: {
            netWorthSnapshots: {
              items: [mockSecondSnapshot],
              totalCount: 2,
            },
          },
        },
      };

      const { result } = renderHook(() => useNetWorthData(), {
        wrapper: createWrapper([mockSnapshotsQuery, page2Query]),
      });

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.onPageChange(2);
      });

      expect(result.current.page).toBe(2);
    });
  });

  describe('modal state transitions', () => {
    it('opens the create modal via onOpenCreate', () => {
      const { result } = renderHook(() => useNetWorthData(), {
        wrapper: createWrapper([mockSnapshotsQuery]),
      });

      act(() => {
        result.current.onOpenCreate();
      });

      expect(result.current.modalState).toEqual({ kind: 'create' });
    });

    it('opens the duplicate modal with the source snapshot', async () => {
      const { result } = renderHook(() => useNetWorthData(), {
        wrapper: createWrapper([mockSnapshotsQuery]),
      });

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.onOpenDuplicate(mockSnapshot);
      });

      expect(result.current.modalState).toEqual({
        kind: 'duplicate',
        source: mockSnapshot,
      });
    });

    it('opens the edit modal with the target snapshot', async () => {
      const { result } = renderHook(() => useNetWorthData(), {
        wrapper: createWrapper([mockSnapshotsQuery]),
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

    it('closes the modal via onCloseModal', () => {
      const { result } = renderHook(() => useNetWorthData(), {
        wrapper: createWrapper([mockSnapshotsQuery]),
      });

      act(() => {
        result.current.onOpenCreate();
      });
      act(() => {
        result.current.onCloseModal();
      });

      expect(result.current.modalState).toEqual({ kind: 'closed' });
    });
  });

  describe('onModalSubmit for create', () => {
    it('creates a snapshot and closes the modal', async () => {
      const createInput = {
        title: 'Test Snapshot',
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
              totalAssets: 5000,
              totalLiabilities: 0,
              netWorth: 5000,
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

      const { result } = renderHook(() => useNetWorthData(), {
        wrapper: createWrapper([mockSnapshotsQuery, createMock, refetchMock]),
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
  });

  describe('onModalSubmit for edit', () => {
    it('updates a snapshot and closes the modal', async () => {
      const updateInput = {
        title: 'January 2026 (updated)',
        entries: [
          {
            type: 'ASSET' as const,
            label: 'Savings',
            amount: 15000,
            category: 'Savings',
          },
        ],
      };

      const updateMock: MockLink.MockedResponse = {
        request: {
          query: UPDATE_NET_WORTH_SNAPSHOT,
          variables: { id: '1', input: updateInput },
        },
        result: {
          data: {
            updateNetWorthSnapshot: {
              ...mockSnapshot,
              title: 'January 2026 (updated)',
              totalAssets: 15000,
              totalLiabilities: 0,
              netWorth: 15000,
              entries: [
                {
                  id: 'e1',
                  type: 'ASSET',
                  label: 'Savings',
                  amount: 15000,
                  category: 'Savings',
                },
              ],
            },
          },
        },
      };

      const listRefetchMock: MockLink.MockedResponse = {
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

      const { result } = renderHook(() => useNetWorthData(), {
        wrapper: createWrapper([
          mockSnapshotsQuery,
          updateMock,
          listRefetchMock,
        ]),
      });

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.onOpenEdit(mockSnapshot);
      });

      await act(async () => {
        await result.current.onModalSubmit(updateInput);
      });

      expect(result.current.modalState).toEqual({ kind: 'closed' });
    });
  });

  describe('delete', () => {
    it('sets snapshotToDelete via onSelectForDelete', () => {
      const { result } = renderHook(() => useNetWorthData(), {
        wrapper: createWrapper([mockSnapshotsQuery]),
      });

      act(() => {
        result.current.onSelectForDelete(mockSnapshot);
      });

      expect(result.current.snapshotToDelete?.id).toBe('1');
    });

    it('clears snapshotToDelete when set to null', () => {
      const { result } = renderHook(() => useNetWorthData(), {
        wrapper: createWrapper([mockSnapshotsQuery]),
      });

      act(() => {
        result.current.onSelectForDelete(mockSnapshot);
      });
      act(() => {
        result.current.onSelectForDelete(null);
      });

      expect(result.current.snapshotToDelete).toBeNull();
    });

    it('does nothing on confirm when no snapshot is selected', async () => {
      const { result } = renderHook(() => useNetWorthData(), {
        wrapper: createWrapper([mockSnapshotsQuery]),
      });

      await act(async () => {
        await result.current.onDeleteConfirm();
      });

      expect(result.current.snapshotToDelete).toBeNull();
    });

    it('deletes a snapshot and clears selection', async () => {
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
          variables: { page: 1, pageSize: PAGE_SIZE },
        },
        result: {
          data: {
            netWorthSnapshots: { items: [], totalCount: 0 },
          },
        },
      };

      const { result } = renderHook(() => useNetWorthData(), {
        wrapper: createWrapper([mockSnapshotsQuery, deleteMock, refetchMock]),
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
