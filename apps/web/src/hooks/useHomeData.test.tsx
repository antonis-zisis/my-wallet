import { MockLink } from '@apollo/client/testing';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { GET_NET_WORTH_SNAPSHOTS } from '../graphql/netWorth';
import {
  GET_REPORT,
  GET_REPORTS,
  GET_REPORTS_SUMMARY,
} from '../graphql/reports';
import { GET_SUBSCRIPTIONS } from '../graphql/subscriptions';
import { MockedProvider } from '../test/apollo-test-utils';
import { useHomeData } from './useHomeData';

const emptyReportsMock: MockLink.MockedResponse = {
  request: { query: GET_REPORTS },
  result: { data: { reports: { items: [], totalCount: 0 } } },
};

const emptyReportsSummaryMock: MockLink.MockedResponse = {
  request: { query: GET_REPORTS_SUMMARY },
  result: { data: { reports: { items: [], totalCount: 0 } } },
};

const emptyNetWorthMock: MockLink.MockedResponse = {
  request: { query: GET_NET_WORTH_SNAPSHOTS, variables: { page: 1 } },
  result: { data: { netWorthSnapshots: { items: [], totalCount: 0 } } },
};

const emptySubscriptionsMock: MockLink.MockedResponse = {
  request: { query: GET_SUBSCRIPTIONS, variables: { page: 1, active: true } },
  result: { data: { subscriptions: { items: [], totalCount: 0 } } },
};

const twoReportsMock: MockLink.MockedResponse = {
  request: { query: GET_REPORTS },
  result: {
    data: {
      reports: {
        items: [
          {
            id: 'r1',
            title: 'February 2026',
            createdAt: '2026-02-01T00:00:00.000Z',
            updatedAt: '2026-02-01T00:00:00.000Z',
          },
          {
            id: 'r2',
            title: 'January 2026',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        ],
        totalCount: 2,
      },
    },
  },
};

const currentReportMock: MockLink.MockedResponse = {
  request: { query: GET_REPORT, variables: { id: 'r1' } },
  result: {
    data: {
      report: {
        id: 'r1',
        title: 'February 2026',
        createdAt: '2026-02-01T00:00:00.000Z',
        updatedAt: '2026-02-01T00:00:00.000Z',
        transactions: [
          {
            id: 't1',
            reportId: 'r1',
            type: 'INCOME',
            amount: 3000,
            description: 'Salary',
            category: 'Salary',
            date: '2026-02-05',
            createdAt: '2026-02-05T00:00:00.000Z',
            updatedAt: '2026-02-05T00:00:00.000Z',
          },
          {
            id: 't2',
            reportId: 'r1',
            type: 'INCOME',
            amount: 500,
            description: 'Freelance',
            category: 'Freelance',
            date: '2026-02-10',
            createdAt: '2026-02-10T00:00:00.000Z',
            updatedAt: '2026-02-10T00:00:00.000Z',
          },
          {
            id: 't3',
            reportId: 'r1',
            type: 'EXPENSE',
            amount: 200,
            description: 'Groceries',
            category: 'Food',
            date: '2026-02-12',
            createdAt: '2026-02-12T00:00:00.000Z',
            updatedAt: '2026-02-12T00:00:00.000Z',
          },
        ],
      },
    },
  },
};

const previousReportMock: MockLink.MockedResponse = {
  request: { query: GET_REPORT, variables: { id: 'r2' } },
  result: {
    data: {
      report: {
        id: 'r2',
        title: 'January 2026',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        transactions: [],
      },
    },
  },
};

const createWrapper =
  (mocks: Array<MockLink.MockedResponse>) =>
  ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks}>{children}</MockedProvider>
  );

describe('useHomeData', () => {
  it('sums only INCOME transactions for currentIncome, ignoring EXPENSE transactions', async () => {
    const { result } = renderHook(() => useHomeData(), {
      wrapper: createWrapper([
        twoReportsMock,
        emptyReportsSummaryMock,
        emptyNetWorthMock,
        emptySubscriptionsMock,
        currentReportMock,
        previousReportMock,
      ]),
    });

    await waitFor(() => {
      expect(result.current.currentReport).toBeDefined();
    });

    expect(result.current.currentIncome).toBe(3500);
  });

  it('returns currentIncome of 0 when the current report has no transactions', async () => {
    const emptyCurrentReportMock: MockLink.MockedResponse = {
      request: { query: GET_REPORT, variables: { id: 'r1' } },
      result: {
        data: {
          report: {
            id: 'r1',
            title: 'February 2026',
            createdAt: '2026-02-01T00:00:00.000Z',
            updatedAt: '2026-02-01T00:00:00.000Z',
            transactions: [],
          },
        },
      },
    };

    const { result } = renderHook(() => useHomeData(), {
      wrapper: createWrapper([
        twoReportsMock,
        emptyReportsSummaryMock,
        emptyNetWorthMock,
        emptySubscriptionsMock,
        emptyCurrentReportMock,
        previousReportMock,
      ]),
    });

    await waitFor(() => {
      expect(result.current.currentLoading).toBe(false);
    });

    expect(result.current.currentIncome).toBe(0);
  });

  it('returns null for lastSnapshot when there are no net worth snapshots', async () => {
    const { result } = renderHook(() => useHomeData(), {
      wrapper: createWrapper([
        emptyReportsMock,
        emptyReportsSummaryMock,
        emptyNetWorthMock,
        emptySubscriptionsMock,
      ]),
    });

    await waitFor(() => {
      expect(result.current.netWorthLoading).toBe(false);
    });

    expect(result.current.lastSnapshot).toBeNull();
  });

  it('leaves currentReport and previousReport undefined when there are no reports', async () => {
    const { result } = renderHook(() => useHomeData(), {
      wrapper: createWrapper([
        emptyReportsMock,
        emptyReportsSummaryMock,
        emptyNetWorthMock,
        emptySubscriptionsMock,
      ]),
    });

    await waitFor(() => {
      expect(result.current.reportsLoading).toBe(false);
    });

    expect(result.current.currentReport).toBeUndefined();
    expect(result.current.previousReport).toBeUndefined();
  });

  it('assigns the first report as current and the second report as previous', async () => {
    const { result } = renderHook(() => useHomeData(), {
      wrapper: createWrapper([
        twoReportsMock,
        emptyReportsSummaryMock,
        emptyNetWorthMock,
        emptySubscriptionsMock,
        currentReportMock,
        previousReportMock,
      ]),
    });

    await waitFor(() => {
      expect(result.current.currentReport).toBeDefined();
      expect(result.current.previousReport).toBeDefined();
    });

    expect(result.current.currentReport?.id).toBe('r1');
    expect(result.current.previousReport?.id).toBe('r2');
  });
});
