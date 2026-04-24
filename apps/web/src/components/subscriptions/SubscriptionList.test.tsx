import { render, screen } from '@testing-library/react';
import { cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
  cancelledAt: null,
  trialEndsAt: null,
  notes: null,
  paymentMethod: null,
  url: null,
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

  it('renders the subscription name as a link when url is set', () => {
    const subscriptions = [
      makeSubscription({ name: 'Netflix', url: 'https://netflix.com/account' }),
    ];
    render(
      <SubscriptionList {...defaultProps} subscriptions={subscriptions} />
    );
    const link = screen.getByRole('link', { name: 'Netflix' });
    expect(link).toHaveAttribute('href', 'https://netflix.com/account');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders the subscription name as plain text when url is not set', () => {
    const subscriptions = [makeSubscription({ name: 'Netflix' })];
    render(
      <SubscriptionList {...defaultProps} subscriptions={subscriptions} />
    );
    expect(
      screen.queryByRole('link', { name: 'Netflix' })
    ).not.toBeInTheDocument();
    expect(screen.getByText('Netflix')).toBeInTheDocument();
  });

  it('shows paymentMethod and notes in the tertiary line', () => {
    const subscriptions = [
      makeSubscription({
        name: 'Netflix',
        paymentMethod: 'Revolut',
        notes: 'shared with sister',
      }),
    ];
    render(
      <SubscriptionList {...defaultProps} subscriptions={subscriptions} />
    );
    expect(
      screen.getByText('via Revolut · shared with sister')
    ).toBeInTheDocument();
  });

  it('shows only notes when paymentMethod is not set', () => {
    const subscriptions = [
      makeSubscription({ name: 'Netflix', notes: 'shared with sister' }),
    ];
    render(
      <SubscriptionList {...defaultProps} subscriptions={subscriptions} />
    );
    expect(screen.getByText('shared with sister')).toBeInTheDocument();
  });

  it('shows only paymentMethod when notes is not set', () => {
    const subscriptions = [
      makeSubscription({ name: 'Netflix', paymentMethod: 'Revolut' }),
    ];
    render(
      <SubscriptionList {...defaultProps} subscriptions={subscriptions} />
    );
    expect(screen.getByText('via Revolut')).toBeInTheDocument();
  });

  it('shows no tertiary line when neither paymentMethod nor notes are set', () => {
    const subscriptions = [makeSubscription({ name: 'Netflix' })];
    render(
      <SubscriptionList {...defaultProps} subscriptions={subscriptions} />
    );
    expect(screen.queryByText(/^via /)).not.toBeInTheDocument();
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

  it('shows Cancel in the dropdown for active non-cancelled subscriptions', async () => {
    const subscriptions = [makeSubscription({ name: 'Netflix' })];
    render(
      <SubscriptionList
        {...defaultProps}
        subscriptions={subscriptions}
        onCancel={vi.fn()}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Options' }));
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('does not show Cancel in the dropdown for already-cancelled subscriptions', async () => {
    const subscriptions = [
      makeSubscription({
        name: 'Netflix',
        cancelledAt: '2026-04-01T00:00:00Z',
        endDate: '2026-04-30T00:00:00Z',
      }),
    ];
    render(
      <SubscriptionList
        {...defaultProps}
        subscriptions={subscriptions}
        onCancel={vi.fn()}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Options' }));
    expect(
      screen.queryByRole('button', { name: 'Cancel' })
    ).not.toBeInTheDocument();
  });

  it('shows a Cancelled badge for cancelled subscriptions', () => {
    const subscriptions = [
      makeSubscription({
        name: 'Netflix',
        cancelledAt: '2026-04-01T00:00:00Z',
        endDate: '2026-04-30T00:00:00Z',
      }),
    ];
    render(
      <SubscriptionList {...defaultProps} subscriptions={subscriptions} />
    );
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });

  it('does not show a Cancelled badge for active subscriptions', () => {
    const subscriptions = [makeSubscription({ name: 'Netflix' })];
    render(
      <SubscriptionList {...defaultProps} subscriptions={subscriptions} />
    );
    expect(screen.queryByText('Cancelled')).not.toBeInTheDocument();
  });

  it('shows an "ends in X days" countdown for cancelled subscriptions', () => {
    const subscriptions = [
      makeSubscription({
        name: 'Netflix',
        cancelledAt: '2026-04-01T00:00:00Z',
        endDate: '2026-04-30T00:00:00Z',
      }),
    ];
    render(
      <SubscriptionList {...defaultProps} subscriptions={subscriptions} />
    );
    expect(screen.getByText(/ends in \d+ days/)).toBeInTheDocument();
  });

  it('shows Resume in the dropdown for cancelled active subscriptions', async () => {
    const subscriptions = [
      makeSubscription({
        name: 'Netflix',
        cancelledAt: '2026-04-01T00:00:00Z',
        endDate: '2026-04-30T00:00:00Z',
      }),
    ];
    render(
      <SubscriptionList
        {...defaultProps}
        subscriptions={subscriptions}
        onResume={vi.fn()}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Options' }));
    expect(screen.getByRole('button', { name: 'Resume' })).toBeInTheDocument();
  });

  it('shows Resume in the dropdown for inactive subscriptions', async () => {
    const subscriptions = [
      makeSubscription({ name: 'Spotify', isActive: false }),
    ];
    render(
      <SubscriptionList
        {...defaultProps}
        subscriptions={subscriptions}
        onResume={vi.fn()}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Options' }));
    expect(screen.getByRole('button', { name: 'Resume' })).toBeInTheDocument();
  });

  it('does not show Resume for normal active subscriptions', async () => {
    const subscriptions = [makeSubscription({ name: 'Netflix' })];
    render(
      <SubscriptionList
        {...defaultProps}
        subscriptions={subscriptions}
        onResume={vi.fn()}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Options' }));
    expect(
      screen.queryByRole('button', { name: 'Resume' })
    ).not.toBeInTheDocument();
  });

  describe('trial period', () => {
    it('shows a Trial badge for active trial subscriptions', () => {
      const subscriptions = [
        makeSubscription({
          name: 'Notion',
          trialEndsAt: '2030-01-01T00:00:00.000Z',
        }),
      ];
      render(
        <SubscriptionList {...defaultProps} subscriptions={subscriptions} />
      );
      expect(screen.getByText('Trial')).toBeInTheDocument();
    });

    it('does not show a Trial badge when the trial has expired', () => {
      const subscriptions = [
        makeSubscription({
          name: 'Notion',
          trialEndsAt: '2020-01-01T00:00:00.000Z',
        }),
      ];
      render(
        <SubscriptionList {...defaultProps} subscriptions={subscriptions} />
      );
      expect(screen.queryByText('Trial')).not.toBeInTheDocument();
    });

    it('shows a trial countdown in the secondary line', () => {
      const subscriptions = [
        makeSubscription({
          name: 'Notion',
          trialEndsAt: '2030-01-01T00:00:00.000Z',
        }),
      ];
      render(
        <SubscriptionList {...defaultProps} subscriptions={subscriptions} />
      );
      expect(screen.getByText(/trial ends in \d+ days/)).toBeInTheDocument();
    });
  });

  describe('renewal relative label', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-04-24T00:00:00.000Z'));
    });

    afterEach(() => {
      cleanup();
      vi.useRealTimers();
    });

    it('shows "in Nd" when the next renewal is within 30 days', () => {
      // startDate on the 28th → next monthly renewal is April 28 (4 days away)
      const subscriptions = [
        makeSubscription({
          name: 'Netflix',
          startDate: '2025-04-28T00:00:00.000Z',
          billingCycle: 'MONTHLY',
        }),
      ];
      render(
        <SubscriptionList {...defaultProps} subscriptions={subscriptions} />
      );
      expect(screen.getByText(/next renewal at/)).toHaveTextContent('in 4d');
    });

    it('does not show a relative label when the next renewal is 30 or more days away', () => {
      // Yearly subscription renewing on June 15 → 52 days from April 24
      const subscriptions = [
        makeSubscription({
          name: 'Adobe',
          startDate: '2025-06-15T00:00:00.000Z',
          billingCycle: 'YEARLY',
          amount: 120,
          monthlyCost: 10,
        }),
      ];
      render(
        <SubscriptionList {...defaultProps} subscriptions={subscriptions} />
      );
      expect(screen.getByText(/next renewal at/)).not.toHaveTextContent('in ');
    });
  });

  it('calls onResume when Resume is clicked', async () => {
    const onResume = vi.fn();
    const subscription = makeSubscription({
      name: 'Netflix',
      cancelledAt: '2026-04-01T00:00:00Z',
      endDate: '2026-04-30T00:00:00Z',
    });
    render(
      <SubscriptionList
        {...defaultProps}
        subscriptions={[subscription]}
        onResume={onResume}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Options' }));
    await userEvent.click(screen.getByRole('button', { name: 'Resume' }));
    expect(onResume).toHaveBeenCalledWith(subscription);
  });
});
