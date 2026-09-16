import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { makeContract } from '../../test/fixtures/contracts';
import { ExpiredContractsSection } from './ExpiredContractsSection';

const expiredContract = makeContract({
  id: 'expired-1',
  provider: 'Old Provider',
  endDate: '2020-01-01T00:00:00Z',
  isExpired: true,
});

const defaultProps = {
  contracts: [expiredContract],
  error: false,
  isCollapsible: true,
  isOpen: true,
  loading: false,
  onDelete: vi.fn(),
  onEdit: vi.fn(),
  onPageChange: vi.fn(),
  onToggle: vi.fn(),
  page: 1,
  pageSize: 10,
  totalCount: 1,
  totalPages: 1,
};

describe('ExpiredContractsSection', () => {
  it('labels the section with the expired count', () => {
    render(<ExpiredContractsSection {...defaultProps} />);

    expect(screen.getByText('Expired Contracts (1)')).toBeInTheDocument();
  });

  it('renders the expired contracts and their pagination', () => {
    render(<ExpiredContractsSection {...defaultProps} />);

    expect(screen.getByText('Old Provider')).toBeInTheDocument();
    expect(screen.getByText('Showing 1 - 1 of 1')).toBeInTheDocument();
  });

  it('hides the pagination while loading', () => {
    render(
      <ExpiredContractsSection {...defaultProps} contracts={[]} loading />
    );

    expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
  });
});
