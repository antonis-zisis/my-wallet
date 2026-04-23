import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { type NetWorthEntry } from '../../types/netWorth';
import { NetWorthCategoryBreakdownChart } from './NetWorthCategoryBreakdownChart';

const makeEntry = (
  overrides: Partial<NetWorthEntry> &
    Pick<NetWorthEntry, 'label' | 'amount' | 'category'>
): NetWorthEntry => ({
  id: crypto.randomUUID(),
  type: 'ASSET',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

describe('NetWorthCategoryBreakdownChart', () => {
  it('renders nothing when entries is empty', () => {
    const { container } = render(
      <NetWorthCategoryBreakdownChart entries={[]} type="ASSET" />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders a legend item for each category', () => {
    const entries = [
      makeEntry({
        label: 'Checking Account',
        amount: 3000,
        category: 'Savings',
      }),
      makeEntry({ label: 'Index Fund', amount: 7000, category: 'Investments' }),
    ];
    render(<NetWorthCategoryBreakdownChart entries={entries} type="ASSET" />);
    expect(screen.getByText('Savings')).toBeInTheDocument();
    expect(screen.getByText('Investments')).toBeInTheDocument();
  });

  it('aggregates amounts for entries sharing a category', () => {
    const entries = [
      makeEntry({ label: 'Checking', amount: 2000, category: 'Savings' }),
      makeEntry({
        label: 'Savings Account',
        amount: 8000,
        category: 'Savings',
      }),
    ];
    render(<NetWorthCategoryBreakdownChart entries={entries} type="ASSET" />);
    expect(screen.getByText(/10\.000,00 €/)).toBeInTheDocument();
  });

  it('shows the correct percentage for each category', () => {
    const entries = [
      makeEntry({
        label: 'Savings Account',
        amount: 3000,
        category: 'Savings',
      }),
      makeEntry({ label: 'Index Fund', amount: 7000, category: 'Investments' }),
    ];
    render(<NetWorthCategoryBreakdownChart entries={entries} type="ASSET" />);
    expect(screen.getByText('(30.0%)')).toBeInTheDocument();
    expect(screen.getByText('(70.0%)')).toBeInTheDocument();
  });

  it('renders for a single category without crashing', () => {
    const entries = [
      makeEntry({
        label: 'Savings Account',
        amount: 5000,
        category: 'Savings',
      }),
    ];
    render(<NetWorthCategoryBreakdownChart entries={entries} type="ASSET" />);
    expect(screen.getByText('Savings')).toBeInTheDocument();
    expect(screen.getByText('(100.0%)')).toBeInTheDocument();
  });

  it('uses liability colour map when type is LIABILITY', () => {
    const entries = [
      makeEntry({
        label: 'Home Loan',
        amount: 50000,
        category: 'Mortgage',
        type: 'LIABILITY',
      }),
    ];
    render(
      <NetWorthCategoryBreakdownChart entries={entries} type="LIABILITY" />
    );
    expect(screen.getByText('Mortgage')).toBeInTheDocument();
  });
});
