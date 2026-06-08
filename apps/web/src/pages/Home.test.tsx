import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { ThemeProvider } from '../contexts/ThemeContext';
import { MockedProvider } from '../test/apollo-test-utils';
import { homeMocks } from '../test/fixtures/home';
import { makeNetWorthSnapshot } from '../test/fixtures/netWorth';
import { makeReport, makeTransaction } from '../test/fixtures/report';
import { makeSubscription } from '../test/fixtures/subscription';
import { Home } from './Home';

function renderHome(mocks: ReturnType<typeof homeMocks>) {
  return render(
    <ThemeProvider>
      <MockedProvider mocks={mocks}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </MockedProvider>
    </ThemeProvider>
  );
}

const currentReport = makeReport({
  id: '1',
  title: 'February 2026',
  transactions: [makeTransaction({ id: 't1', type: 'INCOME', amount: 3000 })],
});

const previousReport = makeReport({
  id: '2',
  title: 'January 2026',
  transactions: [makeTransaction({ id: 't2', type: 'EXPENSE', amount: 200 })],
});

const twoReports = [
  makeReport({ id: '1', title: 'February 2026' }),
  makeReport({ id: '2', title: 'January 2026' }),
];

describe('Home', () => {
  it('shows a loading skeleton before any data has arrived', () => {
    const { container } = renderHome(homeMocks());

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0
    );
  });

  it('renders the current and previous report cards once data arrives', async () => {
    renderHome(
      homeMocks({
        reports: twoReports,
        summaryReports: twoReports,
        reportDetails: [
          { id: '1', report: currentReport },
          { id: '2', report: previousReport },
        ],
      })
    );

    expect(await screen.findByText('February 2026')).toBeInTheDocument();
    expect(await screen.findByText('January 2026')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
  });

  it('shows the net worth card when a snapshot is available', async () => {
    renderHome(
      homeMocks({
        snapshots: [
          makeNetWorthSnapshot({ id: 'nw1', title: 'February 2026' }),
        ],
      })
    );

    expect(
      await screen.findByRole('heading', { name: 'Net Worth' })
    ).toBeInTheDocument();
  });

  it('shows the subscriptions summary when active subscriptions exist', async () => {
    renderHome(
      homeMocks({
        subscriptions: [makeSubscription({ id: 's1', name: 'Netflix' })],
      })
    );

    expect(await screen.findByText('Active Subscriptions')).toBeInTheDocument();
  });

  it('shows the empty-state CTAs when there are no snapshots and no subscriptions', async () => {
    renderHome(homeMocks());

    expect(
      await screen.findByText('No net worth snapshot yet')
    ).toBeInTheDocument();
    expect(
      await screen.findByText('No subscriptions tracked yet')
    ).toBeInTheDocument();
  });
});
