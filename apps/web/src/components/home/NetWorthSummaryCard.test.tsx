import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NetWorthSnapshot } from '../../types/netWorth';
import { NetWorthSummaryCard } from './NetWorthSummaryCard';

const positiveSnapshot: NetWorthSnapshot = {
  id: 'nw1',
  title: 'February 2026',
  totalAssets: 15000,
  totalLiabilities: 3000,
  netWorth: 12000,
  entries: [],
  createdAt: '2026-04-15T00:00:00.000Z',
  updatedAt: '2026-04-15T00:00:00.000Z',
};

const previousSnapshot: NetWorthSnapshot = {
  id: 'nw0',
  title: 'January 2026',
  totalAssets: 11000,
  totalLiabilities: 1000,
  netWorth: 10000,
  entries: [],
  createdAt: '2026-03-01T00:00:00.000Z',
  updatedAt: '2026-03-01T00:00:00.000Z',
};

const negativeSnapshot: NetWorthSnapshot = {
  id: 'nw2',
  title: 'January 2026',
  totalAssets: 1000,
  totalLiabilities: 5000,
  netWorth: -4000,
  entries: [],
  createdAt: '2026-04-15T00:00:00.000Z',
  updatedAt: '2026-04-15T00:00:00.000Z',
};

const staleSnapshot: NetWorthSnapshot = {
  ...positiveSnapshot,
  createdAt: '2025-12-01T00:00:00.000Z',
  updatedAt: '2025-12-01T00:00:00.000Z',
};

interface RenderOptions {
  loading?: boolean;
  previousSnapshot?: NetWorthSnapshot | null;
  recentSnapshots?: Array<NetWorthSnapshot>;
  snapshot: NetWorthSnapshot | null;
}

const renderCard = ({
  loading = false,
  previousSnapshot: previous = null,
  recentSnapshots = [],
  snapshot,
}: RenderOptions) =>
  render(
    <MemoryRouter>
      <NetWorthSummaryCard
        loading={loading}
        previousSnapshot={previous}
        recentSnapshots={recentSnapshots}
        snapshot={snapshot}
      />
    </MemoryRouter>
  );

describe('NetWorthSummaryCard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-22T12:00:00.000Z'));
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the Net Worth heading', () => {
    renderCard({ snapshot: positiveSnapshot });
    expect(
      screen.getByRole('heading', { name: 'Net Worth' })
    ).toBeInTheDocument();
  });

  it('shows only the title and chevron when collapsed', () => {
    renderCard({ snapshot: positiveSnapshot });
    const button = screen.getByRole('button', { name: /net worth/i });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).not.toHaveTextContent(/12\.000,00 €/);
  });

  it('expands when the header button is clicked', () => {
    renderCard({ snapshot: positiveSnapshot });
    fireEvent.click(screen.getByRole('button', { name: /net worth/i }));
    expect(
      screen.getByRole('link', { name: 'February 2026' })
    ).toBeInTheDocument();
  });

  it('collapses again on a second click', () => {
    renderCard({ snapshot: positiveSnapshot });
    const button = screen.getByRole('button', { name: /net worth/i });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows the headline net worth value when expanded', () => {
    renderCard({ snapshot: positiveSnapshot });
    fireEvent.click(screen.getByRole('button', { name: /net worth/i }));
    expect(screen.getByText(/12\.000,00 €/)).toBeInTheDocument();
  });

  it('shows the snapshot title as a link to the snapshot detail', () => {
    renderCard({ snapshot: positiveSnapshot });
    fireEvent.click(screen.getByRole('button', { name: /net worth/i }));
    const link = screen.getByRole('link', { name: 'February 2026' });
    expect(link).toHaveAttribute('href', '/net-worth/nw1');
  });

  describe('delta vs previous snapshot', () => {
    it('shows a positive delta when net worth has grown', () => {
      renderCard({
        previousSnapshot,
        snapshot: positiveSnapshot,
      });
      fireEvent.click(screen.getByRole('button', { name: /net worth/i }));
      expect(
        screen.getByText(/\+2\.000,00 € since January 2026/)
      ).toBeInTheDocument();
    });

    it('shows a negative delta when net worth has shrunk', () => {
      renderCard({
        previousSnapshot: {
          ...previousSnapshot,
          netWorth: 15000,
        },
        snapshot: positiveSnapshot,
      });
      fireEvent.click(screen.getByRole('button', { name: /net worth/i }));
      expect(
        screen.getByText(/-3\.000,00 € since January 2026/)
      ).toBeInTheDocument();
    });

    it('does not show a delta when there is no previous snapshot', () => {
      renderCard({ snapshot: positiveSnapshot });
      fireEvent.click(screen.getByRole('button', { name: /net worth/i }));
      expect(screen.queryByText(/since/)).not.toBeInTheDocument();
    });
  });

  describe('sparkline', () => {
    it('does not render a sparkline with fewer than two snapshots', () => {
      const { container } = renderCard({
        recentSnapshots: [positiveSnapshot],
        snapshot: positiveSnapshot,
      });
      fireEvent.click(screen.getByRole('button', { name: /net worth/i }));
      expect(container.querySelector('.recharts-wrapper')).toBeNull();
    });

    it('renders a sparkline when there are at least two snapshots', () => {
      const { container } = renderCard({
        recentSnapshots: [previousSnapshot, positiveSnapshot],
        snapshot: positiveSnapshot,
      });
      fireEvent.click(screen.getByRole('button', { name: /net worth/i }));
      expect(
        container.querySelector('.recharts-responsive-container')
      ).not.toBeNull();
    });
  });

  describe('staleness indicator', () => {
    it('shows a neutral message for a recent snapshot', () => {
      renderCard({ snapshot: positiveSnapshot });
      fireEvent.click(screen.getByRole('button', { name: /net worth/i }));
      expect(screen.getByText('Last updated 7 days ago')).toBeInTheDocument();
    });

    it('highlights when the snapshot is older than 45 days', () => {
      renderCard({ snapshot: staleSnapshot });
      fireEvent.click(screen.getByRole('button', { name: /net worth/i }));
      const stalenessText = screen.getByText(
        /Last updated \d+ days ago — time for a new snapshot\?/
      );
      expect(stalenessText).toHaveClass('text-orange-600');
    });

    it('handles createdAt delivered as a numeric timestamp string', () => {
      const timestamp = new Date('2026-04-15T00:00:00.000Z').getTime();
      renderCard({
        snapshot: {
          ...positiveSnapshot,
          createdAt: String(timestamp),
        },
      });
      fireEvent.click(screen.getByRole('button', { name: /net worth/i }));
      expect(screen.getByText('Last updated 7 days ago')).toBeInTheDocument();
      expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
    });
  });

  describe('negative net worth', () => {
    it('shows the absolute value with a minus sign when expanded', () => {
      renderCard({ snapshot: negativeSnapshot });
      fireEvent.click(screen.getByRole('button', { name: /net worth/i }));
      const headline = screen.getByText(/-4\.000,00 €/);
      expect(headline).toBeInTheDocument();
      expect(headline).toHaveClass('text-red-600');
    });
  });

  describe('loading state', () => {
    it('shows skeleton when loading is true', () => {
      const { container } = renderCard({ loading: true, snapshot: null });
      expect(
        container.querySelectorAll('.animate-pulse').length
      ).toBeGreaterThan(0);
      expect(
        screen.queryByRole('heading', { name: 'Net Worth' })
      ).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows CTA placeholder when snapshot is null and not loading', () => {
      renderCard({ snapshot: null });
      expect(screen.getByText('No net worth snapshot yet')).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Add a snapshot' })
      ).toHaveAttribute('href', '/net-worth');
    });
  });
});
