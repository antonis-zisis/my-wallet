import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DeleteTransactionModal } from './DeleteTransactionModal';

const defaultProps = {
  isOpen: true,
  isDeleting: false,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  transactionDescription: 'Groceries',
};

describe('DeleteTransactionModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <DeleteTransactionModal {...defaultProps} isOpen={false} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the modal title and transaction description when open', () => {
    render(<DeleteTransactionModal {...defaultProps} />);
    expect(screen.getByText('Delete Transaction')).toBeInTheDocument();
    expect(screen.getByText('Groceries')).toBeInTheDocument();
  });

  it('calls onConfirm when Delete is clicked', async () => {
    const onConfirm = vi.fn();
    render(<DeleteTransactionModal {...defaultProps} onConfirm={onConfirm} />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn();
    render(<DeleteTransactionModal {...defaultProps} onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('disables the Delete button when isDeleting is true', () => {
    render(<DeleteTransactionModal {...defaultProps} isDeleting />);
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
  });
});
