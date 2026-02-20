import { MockLink } from '@apollo/client/testing';
import { render, screen } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { GET_NET_WORTH_SNAPSHOT } from '../graphql/netWorth';
import { MockedProvider } from '../test/apollo-test-utils';
import { NetWorthSnapshotPage } from './NetWorthSnapshotPage';

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
  result: {
    data: { netWorthSnapshot: mockSnapshot },
  },
};

const mockSnapshotQueryError: MockLink.MockedResponse = {
  request: { query: GET_NET_WORTH_SNAPSHOT, variables: { id: '1' } },
  result: {
    errors: [new GraphQLError('Not found')],
  },
};

const mockSnapshotQueryNull: MockLink.MockedResponse = {
  request: { query: GET_NET_WORTH_SNAPSHOT, variables: { id: '1' } },
  result: {
    data: { netWorthSnapshot: null },
  },
};

const renderPage = (mocks: MockLink.MockedResponse[]) => {
  return render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter initialEntries={['/net-worth/1']}>
        <Routes>
          <Route path="/net-worth/:id" element={<NetWorthSnapshotPage />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );
};

describe('NetWorthSnapshotPage', () => {
  it('shows loading state initially', () => {
    renderPage([mockSnapshotQuery]);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders snapshot title after loading', async () => {
    renderPage([mockSnapshotQuery]);
    expect(await screen.findByText('January 2026')).toBeInTheDocument();
  });

  it('shows total assets', async () => {
    renderPage([mockSnapshotQuery]);
    await screen.findByText('January 2026');
    expect(screen.getAllByText('15.000,00 €').length).toBeGreaterThan(0);
  });

  it('shows total liabilities', async () => {
    renderPage([mockSnapshotQuery]);
    await screen.findByText('January 2026');
    expect(screen.getAllByText('3.000,00 €').length).toBeGreaterThan(0);
  });

  it('shows net worth', async () => {
    renderPage([mockSnapshotQuery]);
    await screen.findByText('January 2026');
    expect(screen.getByText('12.000,00 €')).toBeInTheDocument();
  });

  it('renders asset entries', async () => {
    renderPage([mockSnapshotQuery]);
    await screen.findByText('Savings Account');
    expect(screen.getByText('Stocks')).toBeInTheDocument();
  });

  it('renders liability entries', async () => {
    renderPage([mockSnapshotQuery]);
    await screen.findByText('January 2026');
    expect(screen.getAllByText('Car Loan').length).toBeGreaterThan(0);
  });

  it('shows Assets and Liabilities section headings', async () => {
    renderPage([mockSnapshotQuery]);
    await screen.findByText('January 2026');
    expect(screen.getByText('Assets')).toBeInTheDocument();
    expect(screen.getByText('Liabilities')).toBeInTheDocument();
  });

  it('shows error message on query failure', async () => {
    renderPage([mockSnapshotQueryError]);
    expect(
      await screen.findByText('Failed to load snapshot.')
    ).toBeInTheDocument();
  });

  it('shows not found message when snapshot is null', async () => {
    renderPage([mockSnapshotQueryNull]);
    expect(await screen.findByText('Snapshot not found.')).toBeInTheDocument();
  });
});
