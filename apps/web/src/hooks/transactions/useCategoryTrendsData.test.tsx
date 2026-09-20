import { MockLink } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GET_EXPENSE_CATEGORY_TOTALS_BY_MONTH } from '../../graphql/transactions';
import { MockedProvider } from '../../test/apollo-test-utils';
import { useCategoryTrendsData } from './useCategoryTrendsData';

const request = {
  query: GET_EXPENSE_CATEGORY_TOTALS_BY_MONTH,
  variables: { months: 12 },
};

const totals = [
  ...['2026-04', '2026-05', '2026-06', '2026-07'].map((month) => ({
    category: 'Groceries',
    month,
    total: 380,
  })),
  { category: 'Groceries', month: '2026-08', total: 412 },
  { category: 'Household', month: '2026-07', total: 800 },
  { category: 'Household', month: '2026-08', total: 800 },
];

const success: MockLink.MockedResponse = {
  request,
  result: { data: { expenseCategoryTotalsByMonth: totals } },
};

const withHistory: MockLink.MockedResponse = {
  request,
  result: {
    data: {
      expenseCategoryTotalsByMonth: [
        ...['2026-02', '2026-03', '2026-04', '2026-05', '2026-06'].map(
          (month) => ({ category: 'Dining & Takeaway', month, total: 180 })
        ),
        ...[
          '2026-02',
          '2026-03',
          '2026-04',
          '2026-05',
          '2026-06',
          '2026-07',
        ].map((month) => ({ category: 'Household', month, total: 800 })),
        { category: 'Dining & Takeaway', month: '2026-07', total: 310 },
      ],
    },
  },
};

const renderTrends = (mocks: Array<MockLink.MockedResponse>) =>
  renderHook(() => useCategoryTrendsData(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <MockedProvider mocks={mocks}>{children}</MockedProvider>
    ),
  });

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-08-26T00:00:00.000Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useCategoryTrendsData', () => {
  it('starts in a loading state', () => {
    const { result } = renderTrends([success]);

    expect(result.current.loading).toBe(true);
    expect(result.current.trends).toEqual([]);
  });

  it('surfaces an error when the query fails', async () => {
    const { result } = renderTrends([{ request, error: new Error('boom') }]);

    await waitFor(() => expect(result.current.error).toBe(true));

    expect(result.current.trends).toEqual([]);
  });

  it('returns a trend per category with its total and delta', async () => {
    const { result } = renderTrends([success]);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.trends.map((trend) => trend.category)).toEqual([
      'Household',
      'Groceries',
    ]);
    expect(result.current.trends[1].currentTotal).toBe(412);
    expect(result.current.trends[1].delta).toBe(32);
    expect(result.current.currentMonth).toBe('2026-08');
  });

  it('opens and closes the detail view for one category', async () => {
    const { result } = renderTrends([success]);

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.onSelectCategory('Groceries'));
    expect(result.current.selectedTrend?.category).toBe('Groceries');

    act(() => result.current.onClearCategory());
    expect(result.current.selectedTrend).toBeNull();
  });

  it('narrows the month axis when the window changes', async () => {
    const { result } = renderTrends([success]);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.trends[1].points).toHaveLength(5);

    act(() => result.current.onWindowChange(3));

    expect(result.current.trends[1].points).toHaveLength(3);
  });

  it('surfaces what changed in the last complete month', async () => {
    const { result } = renderTrends([withHistory]);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.insightsMonth).toBe('2026-07');
    expect(result.current.insightsBaselineMonths).toBe(5);
    expect(result.current.insights).toHaveLength(1);
    expect(result.current.insights[0]).toMatchObject({
      baselineAverage: 180,
      category: 'Dining & Takeaway',
      direction: 'INCREASE',
      total: 310,
    });
  });
});
