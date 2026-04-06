import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DeleteSubscriptionModal } from './DeleteSubscriptionModal';

const defaultProps = {
  isOpen: true,
  isDeleting: false,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  subscriptionName: 'Spotify',
};

describe('DeleteSubscriptionModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <DeleteSubscriptionModal {...defaultProps} isOpen={false} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the modal title and subscription name when open', () => {
    render(<DeleteSubscriptionModal {...defaultProps} />);
    expect(screen.getByText('Delete Subscription')).toBeInTheDocument();
    expect(screen.getByText('Spotify')).toBeInTheDocument();
  });

  it('calls onConfirm when Delete is clicked', async () => {
    const onConfirm = vi.fn();
    render(<DeleteSubscriptionModal {...defaultProps} onConfirm={onConfirm} />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn();
    render(<DeleteSubscriptionModal {...defaultProps} onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('disables the Delete button when isDeleting is true', () => {
    render(<DeleteSubscriptionModal {...defaultProps} isDeleting />);
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
  });
});
