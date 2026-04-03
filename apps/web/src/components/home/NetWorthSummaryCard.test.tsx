import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { NetWorthSnapshot } from '../../types/netWorth';
import { NetWorthSummaryCard } from './NetWorthSummaryCard';

const positiveSnapshot: NetWorthSnapshot = {
  id: 'nw1',
  title: 'February 2026',
  totalAssets: 15000,
  totalLiabilities: 3000,
  netWorth: 12000,
  entries: [],
  createdAt: '2026-02-01T00:00:00.000Z',
  updatedAt: '2026-02-01T00:00:00.000Z',
};

const negativeSnapshot: NetWorthSnapshot = {
  id: 'nw2',
  title: 'January 2026',
  totalAssets: 1000,
  totalLiabilities: 5000,
  netWorth: -4000,
  entries: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const renderCard = (snapshot: NetWorthSnapshot) =>
  render(
    <MemoryRouter>
      <NetWorthSummaryCard snapshot={snapshot} />
    </MemoryRouter>
  );

describe('NetWorthSummaryCard', () => {
  it('renders the Net Worth heading', () => {
    renderCard(positiveSnapshot);

    expect(
      screen.getByRole('heading', { name: 'Net Worth' })
    ).toBeInTheDocument();
  });

  it('displays the net worth value in the header', () => {
    renderCard(positiveSnapshot);

    expect(screen.getByText(/12\.000,00 €/)).toBeInTheDocument();
  });

  it('is collapsed by default', () => {
    renderCard(positiveSnapshot);

    expect(screen.queryByText('Assets')).not.toBeInTheDocument();
  });

  it('expands when the header button is clicked', () => {
    renderCard(positiveSnapshot);

    fireEvent.click(screen.getByRole('button', { name: /net worth/i }));

    expect(screen.getByText('Assets')).toBeInTheDocument();
  });

  it('collapses again on a second click', () => {
    renderCard(positiveSnapshot);

    const button = screen.getByRole('button', { name: /net worth/i });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(screen.queryByText('Assets')).not.toBeInTheDocument();
  });

  it('shows totalAssets, totalLiabilities and netWorth when expanded', () => {
    renderCard(positiveSnapshot);

    fireEvent.click(screen.getByRole('button', { name: /net worth/i }));

    expect(screen.getByText(/15\.000,00 €/)).toBeInTheDocument();
    expect(screen.getByText(/3\.000,00 €/)).toBeInTheDocument();
    // net worth value appears in both header and grid
    expect(screen.getAllByText(/12\.000,00 €/).length).toBeGreaterThanOrEqual(
      2
    );
  });

  it('shows the snapshot title as a link when expanded', () => {
    renderCard(positiveSnapshot);

    fireEvent.click(screen.getByRole('button', { name: /net worth/i }));

    const link = screen.getByRole('link', { name: 'February 2026' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/net-worth/nw1');
  });

  describe('negative net worth', () => {
    it('displays a minus sign before the value in the header', () => {
      renderCard(negativeSnapshot);

      expect(screen.getByText(/^-/)).toBeInTheDocument();
    });

    it('uses red colour for a negative net worth value', () => {
      renderCard(negativeSnapshot);

      const headerSpan = screen.getByText(/4\.000,00 €/);
      expect(headerSpan).toHaveClass('text-red-600');
    });

    it('shows the absolute value without double negation when expanded', () => {
      renderCard(negativeSnapshot);

      fireEvent.click(screen.getByRole('button', { name: /net worth/i }));

      // Should show "4.000,00 €" not "-4.000,00 €" or "−−4.000,00 €"
      const values = screen.getAllByText(/4\.000,00 €/);
      expect(values.length).toBeGreaterThanOrEqual(1);
      values.forEach((el) => {
        expect(el.textContent).not.toMatch(/--/);
      });
    });
  });
});
