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
  trialEndsAt: null,
  notes: null,
  paymentMethod: null,
  url: null,
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

  it('hides Additional details section when subscription has no optional fields', () => {
    render(<EditSubscriptionModal {...defaultProps} />);
    expect(
      screen.getByLabelText('Website or billing URL').closest('[aria-hidden]')
    ).toHaveAttribute('aria-hidden', 'true');
  });

  it('pre-fills url, paymentMethod, and notes — expanding Additional details automatically', () => {
    const subscription = {
      ...mockSubscription,
      url: 'https://netflix.com/account',
      paymentMethod: 'Revolut',
      notes: 'shared with sister',
    };
    render(
      <EditSubscriptionModal {...defaultProps} subscription={subscription} />
    );
    expect(
      screen.getByLabelText('Website or billing URL').closest('[aria-hidden]')
    ).toHaveAttribute('aria-hidden', 'false');
    expect(screen.getByLabelText('Website or billing URL')).toHaveValue(
      'https://netflix.com/account'
    );
    expect(screen.getByLabelText('Payment method')).toHaveValue('Revolut');
    expect(screen.getByLabelText('Notes')).toHaveValue('shared with sister');
  });

  it('submits updated url, paymentMethod, and notes', async () => {
    const onSubmit = vi.fn();
    render(<EditSubscriptionModal {...defaultProps} onSubmit={onSubmit} />);
    await userEvent.click(
      screen.getByRole('button', { name: /additional details/i })
    );
    await userEvent.type(
      screen.getByLabelText('Website or billing URL'),
      'https://netflix.com/account'
    );
    await userEvent.type(screen.getByLabelText('Payment method'), 'Revolut');
    await userEvent.type(screen.getByLabelText('Notes'), 'shared with sister');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://netflix.com/account',
        paymentMethod: 'Revolut',
        notes: 'shared with sister',
      })
    );
  });

  it('pre-fills trial checkbox and date when subscription has a trial end date', () => {
    const subscription = {
      ...mockSubscription,
      trialEndsAt: '2026-05-03T00:00:00.000Z',
    };
    render(
      <EditSubscriptionModal {...defaultProps} subscription={subscription} />
    );
    expect(screen.getByLabelText('Currently on a free trial')).toBeChecked();
    expect(screen.getByLabelText('Trial ends')).toBeInTheDocument();
  });

  describe('duplicate detection', () => {
    it('shows a warning when renamed to match another existing subscription', async () => {
      render(
        <EditSubscriptionModal
          {...defaultProps}
          existingNames={['Netflix', 'Spotify']}
        />
      );
      await userEvent.clear(screen.getByLabelText('Name'));
      await userEvent.type(screen.getByLabelText('Name'), 'Spotify');
      expect(
        screen.getByText('A subscription with this name already exists.')
      ).toBeInTheDocument();
    });

    it('does not show a warning when keeping the same name as the current subscription', () => {
      render(
        <EditSubscriptionModal
          {...defaultProps}
          existingNames={['Netflix', 'Spotify']}
        />
      );
      expect(
        screen.queryByText('A subscription with this name already exists.')
      ).not.toBeInTheDocument();
    });

    it('warning is case-insensitive', async () => {
      render(
        <EditSubscriptionModal {...defaultProps} existingNames={['Spotify']} />
      );
      await userEvent.clear(screen.getByLabelText('Name'));
      await userEvent.type(screen.getByLabelText('Name'), 'spotify');
      expect(
        screen.getByText('A subscription with this name already exists.')
      ).toBeInTheDocument();
    });

    it('does not show a warning when no existing names are provided', async () => {
      render(<EditSubscriptionModal {...defaultProps} />);
      await userEvent.clear(screen.getByLabelText('Name'));
      await userEvent.type(screen.getByLabelText('Name'), 'Spotify');
      expect(
        screen.queryByText('A subscription with this name already exists.')
      ).not.toBeInTheDocument();
    });

    it('disables the Save button when a duplicate name is entered', async () => {
      render(
        <EditSubscriptionModal
          {...defaultProps}
          existingNames={['Netflix', 'Spotify']}
        />
      );
      await userEvent.clear(screen.getByLabelText('Name'));
      await userEvent.type(screen.getByLabelText('Name'), 'Spotify');
      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    });
  });

  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn();
    render(<EditSubscriptionModal {...defaultProps} onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });
});
