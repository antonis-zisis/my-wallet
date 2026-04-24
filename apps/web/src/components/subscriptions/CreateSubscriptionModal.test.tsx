import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CreateSubscriptionModal } from './CreateSubscriptionModal';

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSubmit: vi.fn(),
};

describe('CreateSubscriptionModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <CreateSubscriptionModal {...defaultProps} isOpen={false} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders form fields when open', () => {
    render(<CreateSubscriptionModal {...defaultProps} />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    expect(screen.getByLabelText('Billing Cycle')).toBeInTheDocument();
    expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
  });

  it('disables the Create button when the form is empty', () => {
    render(<CreateSubscriptionModal {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();
  });

  it('disables the Create button when start date is missing', async () => {
    render(<CreateSubscriptionModal {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Name'), 'Netflix');
    await userEvent.type(screen.getByLabelText('Amount'), '9.99');
    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();
  });

  it('enables the Create button when all required fields are filled', async () => {
    render(<CreateSubscriptionModal {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Name'), 'Netflix');
    await userEvent.type(screen.getByLabelText('Amount'), '9.99');
    await userEvent.type(screen.getByLabelText('Start Date'), '2026-01-01');
    expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled();
  });

  it('submits the correct data and resets the form', async () => {
    const onSubmit = vi.fn();
    render(<CreateSubscriptionModal {...defaultProps} onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('Name'), 'Netflix');
    await userEvent.type(screen.getByLabelText('Amount'), '15.99');
    await userEvent.type(screen.getByLabelText('Start Date'), '2026-01-01');
    await userEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Netflix',
      amount: 15.99,
      billingCycle: 'MONTHLY',
      startDate: '2026-01-01',
      endDate: undefined,
    });
    expect(screen.getByLabelText('Name')).toHaveValue('');
  });

  it('renders URL, Payment method, and Notes fields', () => {
    render(<CreateSubscriptionModal {...defaultProps} />);
    expect(screen.getByLabelText('URL')).toBeInTheDocument();
    expect(screen.getByLabelText('Payment method')).toBeInTheDocument();
    expect(screen.getByLabelText('Notes')).toBeInTheDocument();
  });

  it('submits notes, paymentMethod, and url when filled', async () => {
    const onSubmit = vi.fn();
    render(<CreateSubscriptionModal {...defaultProps} onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('Name'), 'Netflix');
    await userEvent.type(screen.getByLabelText('Amount'), '15.99');
    await userEvent.type(screen.getByLabelText('Start Date'), '2026-01-01');
    await userEvent.type(
      screen.getByLabelText('URL'),
      'https://netflix.com/account'
    );
    await userEvent.type(screen.getByLabelText('Payment method'), 'Revolut');
    await userEvent.type(screen.getByLabelText('Notes'), 'shared with sister');
    await userEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://netflix.com/account',
        paymentMethod: 'Revolut',
        notes: 'shared with sister',
      })
    );
  });

  describe('trial period', () => {
    it('does not show the trial end date field by default', () => {
      render(<CreateSubscriptionModal {...defaultProps} />);
      expect(screen.queryByLabelText('Trial ends')).not.toBeInTheDocument();
    });

    it('shows the trial end date field when trial period is checked', async () => {
      render(<CreateSubscriptionModal {...defaultProps} />);
      await userEvent.click(screen.getByLabelText('Trial period'));
      expect(screen.getByLabelText('Trial ends')).toBeInTheDocument();
    });

    it('disables Create when trial is checked but no trial end date is provided', async () => {
      render(<CreateSubscriptionModal {...defaultProps} />);
      await userEvent.type(screen.getByLabelText('Name'), 'Notion');
      await userEvent.type(screen.getByLabelText('Amount'), '0');
      await userEvent.type(screen.getByLabelText('Start Date'), '2026-04-01');
      await userEvent.click(screen.getByLabelText('Trial period'));
      expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();
    });

    it('submits trialEndsAt when trial period is set', async () => {
      const onSubmit = vi.fn();
      render(<CreateSubscriptionModal {...defaultProps} onSubmit={onSubmit} />);
      await userEvent.type(screen.getByLabelText('Name'), 'Notion');
      await userEvent.type(screen.getByLabelText('Amount'), '0');
      await userEvent.type(screen.getByLabelText('Start Date'), '2026-04-01');
      await userEvent.click(screen.getByLabelText('Trial period'));
      await userEvent.type(screen.getByLabelText('Trial ends'), '2026-05-03');
      await userEvent.click(screen.getByRole('button', { name: 'Create' }));
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ trialEndsAt: '2026-05-03' })
      );
    });
  });

  describe('duplicate detection', () => {
    it('shows a warning when the typed name matches an existing subscription', async () => {
      render(
        <CreateSubscriptionModal
          {...defaultProps}
          existingNames={['Netflix', 'Spotify']}
        />
      );
      await userEvent.type(screen.getByLabelText('Name'), 'Netflix');
      expect(
        screen.getByText('A subscription with this name already exists.')
      ).toBeInTheDocument();
    });

    it('warning is case-insensitive', async () => {
      render(
        <CreateSubscriptionModal
          {...defaultProps}
          existingNames={['Netflix']}
        />
      );
      await userEvent.type(screen.getByLabelText('Name'), 'netflix');
      expect(
        screen.getByText('A subscription with this name already exists.')
      ).toBeInTheDocument();
    });

    it('does not show a warning when the name is unique', async () => {
      render(
        <CreateSubscriptionModal
          {...defaultProps}
          existingNames={['Spotify']}
        />
      );
      await userEvent.type(screen.getByLabelText('Name'), 'Netflix');
      expect(
        screen.queryByText('A subscription with this name already exists.')
      ).not.toBeInTheDocument();
    });

    it('does not show a warning when no existing names are provided', async () => {
      render(<CreateSubscriptionModal {...defaultProps} />);
      await userEvent.type(screen.getByLabelText('Name'), 'Netflix');
      expect(
        screen.queryByText('A subscription with this name already exists.')
      ).not.toBeInTheDocument();
    });

    it('still allows submission when a duplicate name is entered', async () => {
      const onSubmit = vi.fn();
      render(
        <CreateSubscriptionModal
          {...defaultProps}
          onSubmit={onSubmit}
          existingNames={['Netflix']}
        />
      );
      await userEvent.type(screen.getByLabelText('Name'), 'Netflix');
      await userEvent.type(screen.getByLabelText('Amount'), '15.99');
      await userEvent.type(screen.getByLabelText('Start Date'), '2026-01-01');
      await userEvent.click(screen.getByRole('button', { name: 'Create' }));
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn();
    render(<CreateSubscriptionModal {...defaultProps} onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });
});
