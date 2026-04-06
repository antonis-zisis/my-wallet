import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CancelSubscriptionModal } from './CancelSubscriptionModal';

const defaultProps = {
  isOpen: true,
  isCancelling: false,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  subscriptionName: 'Netflix',
};

describe('CancelSubscriptionModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <CancelSubscriptionModal {...defaultProps} isOpen={false} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the modal title and subscription name when open', () => {
    render(<CancelSubscriptionModal {...defaultProps} />);
    expect(
      screen.getByRole('heading', { name: 'Cancel Subscription' })
    ).toBeInTheDocument();
    expect(screen.getByText('Netflix')).toBeInTheDocument();
  });

  it('calls onConfirm when Cancel Subscription is clicked', async () => {
    const onConfirm = vi.fn();
    render(<CancelSubscriptionModal {...defaultProps} onConfirm={onConfirm} />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Cancel Subscription' })
    );
    expect(onConfirm).toHaveBeenCalled();
  });

  it('calls onClose when Keep is clicked', async () => {
    const onClose = vi.fn();
    render(<CancelSubscriptionModal {...defaultProps} onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Keep' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('disables the Cancel Subscription button when isCancelling is true', () => {
    render(<CancelSubscriptionModal {...defaultProps} isCancelling />);
    expect(
      screen.getByRole('button', { name: 'Cancel Subscription' })
    ).toBeDisabled();
  });
});
