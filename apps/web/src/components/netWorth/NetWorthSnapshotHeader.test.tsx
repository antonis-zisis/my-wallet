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
});
