import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { NetWorthSnapshotHeader } from './NetWorthSnapshotHeader';

const defaultProps = {
  createdAt: '2026-01-15T00:00:00Z',
  isPositive: true,
  netWorth: 12000,
  title: 'January 2026',
  totalAssets: 15000,
  totalLiabilities: 3000,
};

describe('NetWorthSnapshotHeader', () => {
  it('renders the snapshot title', () => {
    render(<NetWorthSnapshotHeader {...defaultProps} />);
    expect(screen.getByText('January 2026')).toBeInTheDocument();
  });

  it('renders formatted totalAssets, totalLiabilities and netWorth', () => {
    render(<NetWorthSnapshotHeader {...defaultProps} />);
    expect(screen.getByText(/15\.000,00 €/)).toBeInTheDocument();
    expect(screen.getByText(/3\.000,00 €/)).toBeInTheDocument();
    expect(screen.getByText(/12\.000,00 €/)).toBeInTheDocument();
  });

  it('uses blue styling for a positive net worth', () => {
    render(<NetWorthSnapshotHeader {...defaultProps} isPositive />);
    expect(screen.getByText(/12\.000,00 €/)).toHaveClass('text-blue-600');
  });

  it('uses orange styling for a negative net worth', () => {
    render(
      <NetWorthSnapshotHeader
        {...defaultProps}
        isPositive={false}
        netWorth={-4000}
      />
    );
    expect(screen.getByText(/4\.000,00 €/)).toHaveClass('text-orange-600');
  });

  it('prepends a minus sign for a negative net worth', () => {
    render(
      <NetWorthSnapshotHeader
        {...defaultProps}
        isPositive={false}
        netWorth={-4000}
      />
    );
    const netWorthValue = screen.getByText(/4\.000,00 €/);
    expect(netWorthValue.textContent).toMatch(/^-/);
  });

  it('does not prepend a minus sign for a positive net worth', () => {
    render(<NetWorthSnapshotHeader {...defaultProps} />);
    const netWorthValue = screen.getByText(/12\.000,00 €/);
    expect(netWorthValue.textContent).not.toMatch(/^-/);
  });

  describe('delta labels', () => {
    it('shows positive delta for assets in green with a plus sign', () => {
      render(<NetWorthSnapshotHeader {...defaultProps} deltaAssets={2000} />);
      expect(screen.getByText(/\+2\.000,00 €/)).toHaveClass('text-green-600');
    });

    it('shows negative delta for assets in red with a minus sign', () => {
      render(<NetWorthSnapshotHeader {...defaultProps} deltaAssets={-500} />);
      expect(screen.getByText(/−500,00 €/)).toHaveClass('text-red-600');
    });

    it('hides the delta label when delta is zero', () => {
      render(<NetWorthSnapshotHeader {...defaultProps} deltaAssets={0} />);
      expect(screen.queryByText(/[+−]\d/)).not.toBeInTheDocument();
    });

    it('hides the delta label when delta is null (no previous snapshot)', () => {
      render(<NetWorthSnapshotHeader {...defaultProps} deltaAssets={null} />);
      expect(screen.queryByText(/[+−]\d/)).not.toBeInTheDocument();
    });

    it('shows delta for net worth', () => {
      render(<NetWorthSnapshotHeader {...defaultProps} deltaNetWorth={1200} />);
      expect(screen.getByText(/\+1\.200,00 €/)).toBeInTheDocument();
    });

    it('shows delta for liabilities', () => {
      render(
        <NetWorthSnapshotHeader {...defaultProps} deltaLiabilities={300} />
      );
      expect(screen.getByText(/\+300,00 €/)).toBeInTheDocument();
    });
  });
});
