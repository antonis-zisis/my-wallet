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
  makeReport({ id: 'r1', title: 'February 2026' }),
  makeReport({ id: 'r2', title: 'January 2026' }),
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
});
