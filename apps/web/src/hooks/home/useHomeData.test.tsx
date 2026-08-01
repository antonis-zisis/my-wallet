import { MockLink } from '@apollo/client/testing';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

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
});
