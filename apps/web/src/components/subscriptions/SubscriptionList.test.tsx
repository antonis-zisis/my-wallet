import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { type Subscription } from '../../types/subscription';
import { SubscriptionList } from './SubscriptionList';

const makeSubscription = (
  overrides: Partial<Subscription> & Pick<Subscription, 'name'>
): Subscription => ({
  id: crypto.randomUUID(),
  amount: 9.99,
  billingCycle: 'MONTHLY',
  isActive: true,
  startDate: '2025-01-01',
  endDate: null,
  monthlyCost: 9.99,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

const defaultProps = {
  error: false,
  loading: false,
  onDelete: vi.fn(),
  subscriptions: [],
};

describe('SubscriptionList', () => {
  it('shows a skeleton when loading', () => {
    const { getByTestId } = render(
      <SubscriptionList {...defaultProps} loading />
    );
    expect(getByTestId('subscription-list-skeleton')).toBeInTheDocument();
  });

  it('shows an error message when error is true', () => {
    render(<SubscriptionList {...defaultProps} error />);
    expect(
      screen.getByText('Failed to load subscriptions.')
    ).toBeInTheDocument();
  });

  it('shows the default empty message when there are no subscriptions', () => {
    render(<SubscriptionList {...defaultProps} />);
    expect(screen.getByText('No subscriptions yet.')).toBeInTheDocument();
  });

  it('shows a custom empty message when provided', () => {
    render(
      <SubscriptionList
        {...defaultProps}
        emptyMessage="No inactive subscriptions."
      />
    );
    expect(screen.getByText('No inactive subscriptions.')).toBeInTheDocument();
  });

  it('renders subscription names and amounts', () => {
    const subscriptions = [
      makeSubscription({ name: 'Netflix', amount: 15.99, monthlyCost: 15.99 }),
    ];
    render(
      <SubscriptionList {...defaultProps} subscriptions={subscriptions} />
    );
    expect(screen.getByText('Netflix')).toBeInTheDocument();
    expect(screen.getByText(/15,99 €/)).toBeInTheDocument();
  });

  it('renders a Monthly badge for monthly subscriptions', () => {
    const subscriptions = [
      makeSubscription({ name: 'Netflix', billingCycle: 'MONTHLY' }),
    ];
    render(
      <SubscriptionList {...defaultProps} subscriptions={subscriptions} />
    );
    expect(screen.getByText('Monthly')).toBeInTheDocument();
  });

  it('renders a Yearly badge for yearly subscriptions', () => {
    const subscriptions = [
      makeSubscription({
        name: 'Adobe',
        billingCycle: 'YEARLY',
        amount: 120,
        monthlyCost: 10,
      }),
    ];
    render(
      <SubscriptionList {...defaultProps} subscriptions={subscriptions} />
    );
    expect(screen.getByText('Yearly')).toBeInTheDocument();
  });

  it('calls onDelete when Delete is selected from the dropdown', async () => {
    const onDelete = vi.fn();
    const subscription = makeSubscription({ name: 'Netflix' });
    render(
      <SubscriptionList
        {...defaultProps}
        subscriptions={[subscription]}
        onDelete={onDelete}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Options' }));
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledWith(subscription);
  });

  it('shows Edit in the dropdown when onEdit is provided', async () => {
    const subscriptions = [makeSubscription({ name: 'Netflix' })];
    render(
      <SubscriptionList
        {...defaultProps}
        subscriptions={subscriptions}
        onEdit={vi.fn()}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Options' }));
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('does not show Edit in the dropdown when onEdit is not provided', async () => {
    const subscriptions = [makeSubscription({ name: 'Netflix' })];
    render(
      <SubscriptionList {...defaultProps} subscriptions={subscriptions} />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Options' }));
    expect(
      screen.queryByRole('button', { name: 'Edit' })
    ).not.toBeInTheDocument();
  });
});
