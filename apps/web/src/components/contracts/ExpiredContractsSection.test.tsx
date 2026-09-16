import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  isOpen: false,
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

  it('reports the collapsed state to assistive technology', () => {
    render(<ExpiredContractsSection {...defaultProps} />);

    expect(
      screen.getByRole('button', { name: /Expired Contracts/ })
    ).toHaveAttribute('aria-expanded', 'false');
  });

  it('calls onToggle when the header is clicked', async () => {
    const onToggle = vi.fn();

    render(<ExpiredContractsSection {...defaultProps} onToggle={onToggle} />);

    await userEvent.click(
      screen.getByRole('button', { name: /Expired Contracts/ })
    );

    expect(onToggle).toHaveBeenCalled();
  });

  it('renders the expired contracts when open', () => {
    render(<ExpiredContractsSection {...defaultProps} isOpen />);

    expect(screen.getByText('Old Provider')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Expired Contracts/ })
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('drops the toggle when the section is not collapsible', () => {
    render(
      <ExpiredContractsSection {...defaultProps} isCollapsible={false} isOpen />
    );

    expect(screen.getByText('Expired Contracts (1)')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Expired Contracts/ })
    ).not.toBeInTheDocument();
  });
});
