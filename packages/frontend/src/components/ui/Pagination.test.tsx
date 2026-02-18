import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Pagination } from './Pagination';

const defaultProps = {
  page: 1,
  totalPages: 3,
  totalCount: 55,
  pageSize: 20,
  itemCount: 20,
  onPageChange: vi.fn(),
};

describe('Pagination', () => {
  it('shows the correct item range and total', () => {
    render(<Pagination {...defaultProps} />);
    expect(screen.getByText('Showing 1 - 20 of 55')).toBeInTheDocument();
  });

  it('shows the correct item range on page 2', () => {
    render(<Pagination {...defaultProps} page={2} itemCount={20} />);
    expect(screen.getByText('Showing 21 - 40 of 55')).toBeInTheDocument();
  });

  it('shows the correct item range on the last page', () => {
    render(<Pagination {...defaultProps} page={3} itemCount={15} />);
    expect(screen.getByText('Showing 41 - 55 of 55')).toBeInTheDocument();
  });

  it('shows the correct item range on page 2 as the centre label', () => {
    render(<Pagination {...defaultProps} page={2} itemCount={20} />);
    expect(screen.getByText('Showing 21 - 40 of 55')).toBeInTheDocument();
  });

  it('disables Previous button on page 1', () => {
    render(<Pagination {...defaultProps} page={1} />);
    expect(
      screen.getByRole('button', { name: 'Previous page' })
    ).toBeDisabled();
  });

  it('enables Previous button past page 1', () => {
    render(<Pagination {...defaultProps} page={2} />);
    expect(
      screen.getByRole('button', { name: 'Previous page' })
    ).not.toBeDisabled();
  });

  it('disables Next button on the last page', () => {
    render(<Pagination {...defaultProps} page={3} />);
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('enables Next button before the last page', () => {
    render(<Pagination {...defaultProps} page={2} />);
    expect(
      screen.getByRole('button', { name: 'Next page' })
    ).not.toBeDisabled();
  });

  it('calls onPageChange with page - 1 when Previous is clicked', async () => {
    const onPageChange = vi.fn();
    render(
      <Pagination {...defaultProps} page={2} onPageChange={onPageChange} />
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Previous page' })
    );
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('calls onPageChange with page + 1 when Next is clicked', async () => {
    const onPageChange = vi.fn();
    render(
      <Pagination {...defaultProps} page={1} onPageChange={onPageChange} />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
