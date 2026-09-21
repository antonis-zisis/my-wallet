import { MockLink } from '@apollo/client/testing';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MockedProvider } from '../../test/apollo-test-utils';
import { homeMocks } from '../../test/fixtures/home';
import { makeReport, makeTransaction } from '../../test/fixtures/report';
import { useHomeData } from './useHomeData';

function renderWithMocks(mocks: Array<MockLink.MockedResponse>) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks}>{children}</MockedProvider>
  );

  return renderHook(() => useHomeData(), { wrapper });
}

const currentReport = makeReport({
  id: 'r1',
  title: 'February 2026',
  transactions: [
    makeTransaction({ id: 't1', type: 'INCOME', amount: 3000 }),
    makeTransaction({ id: 't2', type: 'INCOME', amount: 500 }),
    makeTransaction({ id: 't3', type: 'EXPENSE', amount: 200 }),
  ],
});

const previousReport = makeReport({
  id: 'r2',
  title: 'January 2026',
  transactions: [],
});

const twoReportsList = [
  makeReport({ id: 'r1', title: 'February 2026', transactionCount: 3 }),
  makeReport({ id: 'r2', title: 'January 2026', transactionCount: 2 }),
];

describe('useHomeData', () => {
  it('returns empty defaults when nothing is loaded', async () => {
    const { result } = renderWithMocks(homeMocks());

    await waitFor(() => {
      expect(result.current.reportsLoading).toBe(false);
    });

    expect(result.current.lastSnapshot).toBeNull();
    expect(result.current.currentReport).toBeUndefined();
    expect(result.current.previousReport).toBeUndefined();
    expect(result.current.activeSubscriptions).toEqual([]);
  });

  it('sums only INCOME transactions for currentIncome', async () => {
    const { result } = renderWithMocks(
      homeMocks({
        reports: twoReportsList,
        reportDetails: [
          { id: 'r1', report: currentReport },
          { id: 'r2', report: previousReport },
        ],
      })
    );

    await waitFor(() => {
      expect(result.current.currentReport).toBeDefined();
    });

    expect(result.current.currentIncome).toBe(3500);
  });

  it('assigns the first report as current and the second as previous', async () => {
    const { result } = renderWithMocks(
      homeMocks({
        reports: twoReportsList,
        reportDetails: [
          { id: 'r1', report: currentReport },
          { id: 'r2', report: previousReport },
        ],
      })
    );

    await waitFor(() => {
      expect(result.current.currentReport).toBeDefined();
      expect(result.current.previousReport).toBeDefined();
    });

    expect(result.current.currentReport?.id).toBe('r1');
    expect(result.current.previousReport?.id).toBe('r2');
  });

  it('skips empty reports when assigning current and previous', async () => {
    const { result } = renderWithMocks(
      homeMocks({
        reports: [
          makeReport({ id: 'r0', title: 'March 2026', transactionCount: 0 }),
          ...twoReportsList,
        ],
        reportDetails: [
          { id: 'r1', report: currentReport },
          { id: 'r2', report: previousReport },
        ],
      })
    );

    await waitFor(() => {
      expect(result.current.currentReport).toBeDefined();
      expect(result.current.previousReport).toBeDefined();
    });

    expect(result.current.currentReport?.id).toBe('r1');
    expect(result.current.previousReport?.id).toBe('r2');
  });

  it('excludes reports with no transactions from chartReports', async () => {
    const { result } = renderWithMocks(
      homeMocks({
        summaryReports: [
          makeReport({ id: 'r1', transactions: [makeTransaction()] }),
          makeReport({ id: 'r2', transactions: [] }),
        ],
      })
    );

    await waitFor(() => {
      expect(result.current.summaryLoading).toBe(false);
    });

    expect(result.current.chartReports.map((report) => report.id)).toEqual([
      'r1',
    ]);
  });
  describe('spending insight', () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date('2026-08-26T00:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('surfaces the category that moved most against its baseline', async () => {
      const baselineMonths = [
        '2026-01',
        '2026-02',
        '2026-03',
        '2026-04',
        '2026-05',
        '2026-06',
      ];

      const { result } = renderWithMocks(
        homeMocks({
          categoryTotals: [
            ...baselineMonths.map((month) => ({
              category: 'Groceries',
              month,
              total: 100,
            })),
            ...baselineMonths.map((month) => ({
              category: 'Transport',
              month,
              total: 50,
            })),
            { category: 'Groceries', month: '2026-07', total: 400 },
            { category: 'Transport', month: '2026-07', total: 100 },
          ],
        })
      );

      await waitFor(() => {
        expect(result.current.spendingInsight).not.toBeNull();
      });

      expect(result.current.spendingInsight?.category).toBe('Groceries');
      expect(result.current.spendingInsight?.difference).toBe(300);
      expect(result.current.spendingInsightMonth).toBe('2026-07');
      expect(result.current.spendingInsightBaselineMonths).toBe(6);
    });

    it('has no insight when there is not enough history', async () => {
      const { result } = renderWithMocks(
        homeMocks({
          categoryTotals: [
            { category: 'Groceries', month: '2026-07', total: 400 },
          ],
        })
      );

      await waitFor(() => {
        expect(result.current.reportsLoading).toBe(false);
      });

      expect(result.current.spendingInsight).toBeNull();
    });
  });
});
