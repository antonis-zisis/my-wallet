import { MockLink } from '@apollo/client/testing';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { PrivacyProvider } from '../contexts/PrivacyContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { GET_EXPENSE_CATEGORY_TOTALS_BY_MONTH } from '../graphql/transactions';
import { MockedProvider } from '../test/apollo-test-utils';
import { CategoryTrends } from './CategoryTrends';

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(private callback: ResizeObserverCallback) {}
      observe(target: Element) {
        this.callback(
          [
            { contentRect: { width: 800, height: 600 }, target },
          ] as unknown as Array<ResizeObserverEntry>,
          this as unknown as ResizeObserver
        );
      }
      unobserve() {}
      disconnect() {}
    }
  );
});

const request = {
  query: GET_EXPENSE_CATEGORY_TOTALS_BY_MONTH,
  variables: { months: 12 },
};

const success: MockLink.MockedResponse = {
  request,
  result: {
    data: {
      expenseCategoryTotalsByMonth: [
        { category: 'Groceries', month: '2026-07', total: 380 },
        { category: 'Groceries', month: '2026-08', total: 412 },
        { category: 'Rent', month: '2026-07', total: 800 },
        { category: 'Rent', month: '2026-08', total: 800 },
      ],
    },
  },
};

const renderPage = (mocks: Array<MockLink.MockedResponse>) =>
  render(
    <MemoryRouter>
      <MockedProvider mocks={mocks}>
        <ThemeProvider>
          <PrivacyProvider>
            <CategoryTrends />
          </PrivacyProvider>
        </ThemeProvider>
      </MockedProvider>
    </MemoryRouter>
  );

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-08-26T00:00:00.000Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('CategoryTrends', () => {
  it('always shows the heading and a way back to reports', () => {
    renderPage([success]);

    expect(
      screen.getByRole('heading', { name: 'Category Trends' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Back to Reports/ })
    ).toBeInTheDocument();
  });

  it('shows an error state when the query fails', async () => {
    renderPage([{ request, error: new Error('boom') }]);

    expect(
      await screen.findByText('Could not load category trends')
    ).toBeInTheDocument();
  });

  it('shows an empty state when there is not enough history', async () => {
    renderPage([
      {
        request,
        result: {
          data: {
            expenseCategoryTotalsByMonth: [
              { category: 'Rent', month: '2026-08', total: 800 },
            ],
          },
        },
      },
    ]);

    expect(
      await screen.findByText('Not enough history yet')
    ).toBeInTheDocument();
  });

  it('renders a tile per category with its total and comparison scope', async () => {
    renderPage([success]);

    expect(await screen.findByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('Rent')).toBeInTheDocument();
    expect(screen.getByText('412,00 €')).toBeInTheDocument();
    expect(
      screen.getByText('Across all reports · Aug so far vs Jul')
    ).toBeInTheDocument();
  });

  it('opens the detail view for a category when its tile is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderPage([success]);

    await user.click(await screen.findByRole('button', { name: /Groceries/ }));

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /All categories/ })
      ).toBeInTheDocument()
    );
    expect(screen.queryByText('Rent')).not.toBeInTheDocument();
  });
});
