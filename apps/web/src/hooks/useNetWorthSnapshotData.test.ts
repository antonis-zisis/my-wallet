import { MockLink } from '@apollo/client/testing';
import { renderHook, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { createElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { GET_NET_WORTH_SNAPSHOT } from '../graphql/netWorth';
import { createWrapper } from '../test/hook-test-utils';
import { useNetWorthSnapshotData } from './useNetWorthSnapshotData';

const mockEntries = [
  {
    id: 'entry-1',
    type: 'ASSET',
    label: 'Savings Account',
    amount: 10000,
    category: 'Savings',
  },
  {
    id: 'entry-2',
    type: 'ASSET',
    label: 'Stocks',
    amount: 5000,
    category: 'Investments',
  },
  {
    id: 'entry-3',
    type: 'LIABILITY',
    label: 'Car Loan',
    amount: 3000,
    category: 'Car Loan',
  },
];

const mockSnapshot = {
  id: '1',
  title: 'January 2026',
  totalAssets: 15000,
  totalLiabilities: 3000,
  netWorth: 12000,
  entries: mockEntries,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const mockSnapshotQuery: MockLink.MockedResponse = {
  request: { query: GET_NET_WORTH_SNAPSHOT, variables: { id: '1' } },
  result: { data: { netWorthSnapshot: mockSnapshot } },
};

const mockSnapshotQueryNull: MockLink.MockedResponse = {
  request: { query: GET_NET_WORTH_SNAPSHOT, variables: { id: '1' } },
  result: { data: { netWorthSnapshot: null } },
};

const mockSnapshotQueryError: MockLink.MockedResponse = {
  request: { query: GET_NET_WORTH_SNAPSHOT, variables: { id: '1' } },
  result: { errors: [new GraphQLError('Not found')] },
};

const mockNegativeSnapshot = {
  ...mockSnapshot,
  netWorth: -1000,
};

const mockNegativeQuery: MockLink.MockedResponse = {
  request: { query: GET_NET_WORTH_SNAPSHOT, variables: { id: '1' } },
  result: { data: { netWorthSnapshot: mockNegativeSnapshot } },
};

function createRouterWrapper(mocks: Array<MockLink.MockedResponse>) {
  const apolloWrapper = createWrapper(mocks);
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(
      apolloWrapper,
      null,
      createElement(
        MemoryRouter,
        { initialEntries: ['/net-worth/1'] },
        createElement(
          Routes,
          null,
          createElement(Route, {
            path: '/net-worth/:id',
            element: children as React.ReactElement,
          })
        )
      )
    );
  };
}

describe('useNetWorthSnapshotData', () => {
  describe('initial state', () => {
    it('starts with loading true and no snapshot', () => {
      const { result } = renderHook(() => useNetWorthSnapshotData(), {
        wrapper: createRouterWrapper([mockSnapshotQuery]),
      });

      expect(result.current.loading).toBe(true);
      expect(result.current.snapshot).toBeNull();
      expect(result.current.error).toBe(false);
    });
  });

  describe('data loading', () => {
    it('loads snapshot and splits entries by type', async () => {
      const { result } = renderHook(() => useNetWorthSnapshotData(), {
        wrapper: createRouterWrapper([mockSnapshotQuery]),
      });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.snapshot?.title).toBe('January 2026');
      expect(result.current.assets).toHaveLength(2);
      expect(result.current.liabilities).toHaveLength(1);
    });

    it('returns only assets in assets array', async () => {
      const { result } = renderHook(() => useNetWorthSnapshotData(), {
        wrapper: createRouterWrapper([mockSnapshotQuery]),
      });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(
        result.current.assets.every((entry) => entry.type === 'ASSET')
      ).toBe(true);
    });

    it('returns only liabilities in liabilities array', async () => {
      const { result } = renderHook(() => useNetWorthSnapshotData(), {
        wrapper: createRouterWrapper([mockSnapshotQuery]),
      });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(
        result.current.liabilities.every((entry) => entry.type === 'LIABILITY')
      ).toBe(true);
    });

    it('sets isPositive true when net worth is positive', async () => {
      const { result } = renderHook(() => useNetWorthSnapshotData(), {
        wrapper: createRouterWrapper([mockSnapshotQuery]),
      });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.isPositive).toBe(true);
    });

    it('sets isPositive false when net worth is negative', async () => {
      const { result } = renderHook(() => useNetWorthSnapshotData(), {
        wrapper: createRouterWrapper([mockNegativeQuery]),
      });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.isPositive).toBe(false);
    });

    it('returns null snapshot when server returns null', async () => {
      const { result } = renderHook(() => useNetWorthSnapshotData(), {
        wrapper: createRouterWrapper([mockSnapshotQueryNull]),
      });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.snapshot).toBeNull();
      expect(result.current.error).toBe(false);
    });

    it('sets error true on query failure', async () => {
      const { result } = renderHook(() => useNetWorthSnapshotData(), {
        wrapper: createRouterWrapper([mockSnapshotQueryError]),
      });

      await waitFor(() => expect(result.current.error).toBe(true));
    });
  });
});
