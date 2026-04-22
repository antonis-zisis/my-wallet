import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { type NetWorthEntry } from '../../types/netWorth';
import { NetWorthEntriesSection } from './NetWorthEntriesSection';

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

const defaultProps = {
  colorClass: 'text-green-600',
  title: 'Assets',
  total: 0,
};

describe('NetWorthEntriesSection', () => {
  it('renders nothing when entries is empty', () => {
    const { container } = render(
      <NetWorthEntriesSection {...defaultProps} entries={[]} total={0} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders the section title and formatted total', () => {
    const entries = [
      makeEntry({ label: 'Savings', amount: 3000, category: 'Savings' }),
    ];
    render(
      <NetWorthEntriesSection
        {...defaultProps}
        entries={entries}
        total={5000}
      />
    );
    expect(screen.getByText('Assets')).toBeInTheDocument();
    expect(screen.getByText(/5\.000,00 €/)).toBeInTheDocument();
  });

  it('renders entry labels and amounts', () => {
    const entries = [
      makeEntry({
        label: 'Savings Account',
        amount: 3000,
        category: 'Savings',
      }),
      makeEntry({ label: 'Stocks', amount: 7000, category: 'Investments' }),
    ];
    render(
      <NetWorthEntriesSection
        {...defaultProps}
        entries={entries}
        total={10000}
      />
    );
    expect(screen.getByText('Savings Account')).toBeInTheDocument();
    expect(screen.getByText('Stocks')).toBeInTheDocument();
    expect(screen.getByText(/3\.000,00 €/)).toBeInTheDocument();
    expect(screen.getByText(/7\.000,00 €/)).toBeInTheDocument();
  });

  describe('entryDeltas', () => {
    it('shows a positive delta in green next to the entry', () => {
      const entries = [
        makeEntry({
          label: 'Savings Account',
          amount: 5200,
          category: 'Savings',
        }),
      ];
      render(
        <NetWorthEntriesSection
          {...defaultProps}
          entries={entries}
          total={5200}
          entryDeltas={{
            'Savings:Savings Account': { delta: 200, isNew: false },
          }}
        />
      );
      expect(screen.getByText(/\+200,00 €/)).toHaveClass('text-green-600');
    });

    it('shows a negative delta in red next to the entry', () => {
      const entries = [
        makeEntry({
          label: 'Savings Account',
          amount: 4800,
          category: 'Savings',
        }),
      ];
      render(
        <NetWorthEntriesSection
          {...defaultProps}
          entries={entries}
          total={4800}
          entryDeltas={{
            'Savings:Savings Account': { delta: -200, isNew: false },
          }}
        />
      );
      expect(screen.getByText(/−200,00 €/)).toHaveClass('text-red-600');
    });

    it('shows a "New" badge for entries not in the previous snapshot', () => {
      const entries = [
        makeEntry({
          label: 'Savings Account',
          amount: 3000,
          category: 'Savings',
        }),
      ];
      render(
        <NetWorthEntriesSection
          {...defaultProps}
          entries={entries}
          total={3000}
          entryDeltas={{ 'Savings:Savings Account': { delta: 0, isNew: true } }}
        />
      );
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('hides the delta label when delta is zero and entry is not new', () => {
      const entries = [
        makeEntry({
          label: 'Savings Account',
          amount: 3000,
          category: 'Savings',
        }),
      ];
      render(
        <NetWorthEntriesSection
          {...defaultProps}
          entries={entries}
          total={3000}
          entryDeltas={{
            'Savings:Savings Account': { delta: 0, isNew: false },
          }}
        />
      );
      expect(screen.queryByText('New')).not.toBeInTheDocument();
      expect(screen.queryByText(/[+−]\d/)).not.toBeInTheDocument();
    });

    it('shows no deltas when entryDeltas is not provided', () => {
      const entries = [
        makeEntry({
          label: 'Savings Account',
          amount: 3000,
          category: 'Savings',
        }),
      ];
      render(
        <NetWorthEntriesSection
          {...defaultProps}
          entries={entries}
          total={3000}
        />
      );
      expect(screen.queryByText('New')).not.toBeInTheDocument();
      expect(screen.queryByText(/[+−]\d/)).not.toBeInTheDocument();
    });
  });

  it('groups entries under their category headings', () => {
    const entries = [
      makeEntry({ label: 'Emergency Fund', amount: 2000, category: 'Savings' }),
      makeEntry({ label: 'Index Fund', amount: 5000, category: 'Investments' }),
      makeEntry({ label: 'Pension', amount: 3000, category: 'Investments' }),
    ];
    render(
      <NetWorthEntriesSection
        {...defaultProps}
        entries={entries}
        total={10000}
      />
    );
    expect(screen.getByText('Savings')).toBeInTheDocument();
    expect(screen.getByText('Investments')).toBeInTheDocument();
  });
});
