import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { type Subscription } from '../../types/subscription';
import { ResumeSubscriptionModal } from './ResumeSubscriptionModal';

const mockSubscription: Subscription = {
  id: 'sub-1',
  name: 'Netflix',
  amount: 15.99,
  billingCycle: 'MONTHLY',
  isActive: false,
  startDate: '2025-01-15',
  endDate: '2026-01-15',
  cancelledAt: '2025-12-01T00:00:00Z',
  trialEndsAt: null,
  notes: null,
  paymentMethod: null,
  url: null,
  monthlyCost: 15.99,
  createdAt: '2025-01-15T00:00:00Z',
  updatedAt: '2025-12-01T00:00:00Z',
};

const defaultProps = {
  isOpen: true,
  isResuming: false,
  onClose: vi.fn(),
  onSubmit: vi.fn(),
  subscription: mockSubscription,
};

describe('ResumeSubscriptionModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <ResumeSubscriptionModal {...defaultProps} isOpen={false} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the modal title and subscription name when open', () => {
    render(<ResumeSubscriptionModal {...defaultProps} />);
    expect(
      screen.getByRole('heading', { name: 'Resume Subscription' })
    ).toBeInTheDocument();
    expect(screen.getByText('Netflix')).toBeInTheDocument();
  });

  it('pre-fills amount from the subscription', () => {
    render(<ResumeSubscriptionModal {...defaultProps} />);
    expect(screen.getByLabelText('Amount')).toHaveValue(15.99);
  });

  it('pre-fills billing cycle from the subscription', () => {
    render(<ResumeSubscriptionModal {...defaultProps} />);
    expect(screen.getByLabelText('Billing Cycle')).toHaveValue('MONTHLY');
  });

  it('starts with an empty start date', () => {
    render(<ResumeSubscriptionModal {...defaultProps} />);
    expect(screen.getByLabelText('New Start Date')).toHaveValue('');
  });

  it('disables Resume button when start date is empty', () => {
    render(<ResumeSubscriptionModal {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Resume' })).toBeDisabled();
  });

  it('enables Resume button when start date is filled', async () => {
    render(<ResumeSubscriptionModal {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('New Start Date'), '2026-05-01');
    expect(screen.getByRole('button', { name: 'Resume' })).not.toBeDisabled();
  });

  it('calls onSubmit with id, startDate, amount, and billingCycle', async () => {
    const onSubmit = vi.fn();
    render(<ResumeSubscriptionModal {...defaultProps} onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('New Start Date'), '2026-05-01');
    await userEvent.click(screen.getByRole('button', { name: 'Resume' }));
    expect(onSubmit).toHaveBeenCalledWith({
      id: 'sub-1',
      startDate: '2026-05-01',
      amount: 15.99,
      billingCycle: 'MONTHLY',
    });
  });

  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn();
    render(<ResumeSubscriptionModal {...defaultProps} onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('disables the Resume button when isResuming is true', () => {
    render(<ResumeSubscriptionModal {...defaultProps} isResuming />);
    expect(screen.getByRole('button', { name: 'Resume' })).toBeDisabled();
  });
});
