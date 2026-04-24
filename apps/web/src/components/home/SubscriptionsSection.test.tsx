import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { type Subscription } from '../../types/subscription';
import { SubscriptionsSection } from './SubscriptionsSection';

const makeSubscription = (
  overrides: Partial<Subscription> & Pick<Subscription, 'name'>
): Subscription => ({
  id: crypto.randomUUID(),
  amount: 10,
  billingCycle: 'MONTHLY',
  isActive: true,
  startDate: '2025-01-01',
  endDate: null,
  cancelledAt: null,
  trialEndsAt: null,
  monthlyCost: 10,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

const renderSection = (
  props: React.ComponentProps<typeof SubscriptionsSection>
) =>
  render(
    <MemoryRouter>
      <SubscriptionsSection {...props} />
    </MemoryRouter>
  );

describe('SubscriptionsSection', () => {
  it('shows a skeleton when loading', () => {
    const { container } = renderSection({
      currentIncome: 0,
      loading: true,
      subscriptions: [],
    });
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0
    );
    expect(
      screen.queryByText('No subscriptions tracked yet')
    ).not.toBeInTheDocument();
  });

  it('shows the CTA card when not loading and there are no subscriptions', () => {
    renderSection({ currentIncome: 0, loading: false, subscriptions: [] });
    expect(
      screen.getByText('No subscriptions tracked yet')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Add a subscription' })
    ).toHaveAttribute('href', '/subscriptions');
  });

  it('shows summary and renewals when subscriptions are present', () => {
    const subscriptions = [makeSubscription({ name: 'Netflix' })];
    renderSection({ currentIncome: 500, loading: false, subscriptions });
    expect(screen.getByText('Active Subscriptions')).toBeInTheDocument();
    expect(screen.getByText('Upcoming Renewals')).toBeInTheDocument();
  });
});
