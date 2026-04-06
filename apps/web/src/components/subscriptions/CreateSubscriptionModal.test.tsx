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

  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn();
    render(<CreateSubscriptionModal {...defaultProps} onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });
});
