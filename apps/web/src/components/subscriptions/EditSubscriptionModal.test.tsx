import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { type Subscription } from '../../types/subscription';
import { EditSubscriptionModal } from './EditSubscriptionModal';

const mockSubscription: Subscription = {
  id: 'sub-1',
  name: 'Netflix',
  amount: 15.99,
  billingCycle: 'MONTHLY',
  isActive: true,
  startDate: '2025-01-15',
  endDate: null,
  cancelledAt: null,
  monthlyCost: 15.99,
  createdAt: '2025-01-15T00:00:00Z',
  updatedAt: '2025-01-15T00:00:00Z',
};

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSubmit: vi.fn(),
  subscription: mockSubscription,
};

describe('EditSubscriptionModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <EditSubscriptionModal {...defaultProps} isOpen={false} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('pre-fills form fields from the subscription prop', () => {
    render(<EditSubscriptionModal {...defaultProps} />);
    expect(screen.getByLabelText('Name')).toHaveValue('Netflix');
    expect(screen.getByLabelText('Amount')).toHaveValue(15.99);
  });

  it('disables Save when subscription is null', () => {
    render(<EditSubscriptionModal {...defaultProps} subscription={null} />);
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('submits updated data with the subscription id', async () => {
    const onSubmit = vi.fn();
    render(<EditSubscriptionModal {...defaultProps} onSubmit={onSubmit} />);
    await userEvent.clear(screen.getByLabelText('Name'));
    await userEvent.type(screen.getByLabelText('Name'), 'Netflix HD');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'sub-1', name: 'Netflix HD' })
    );
  });

  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn();
    render(<EditSubscriptionModal {...defaultProps} onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });
});
