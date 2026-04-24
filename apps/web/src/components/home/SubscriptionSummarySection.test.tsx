import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { type Subscription } from '../../types/subscription';
import { SubscriptionSummarySection } from './SubscriptionSummarySection';

const makeSubscription = (
  overrides: Partial<Subscription> & Pick<Subscription, 'name' | 'monthlyCost'>
): Subscription => ({
  id: crypto.randomUUID(),
  amount: overrides.monthlyCost,
  billingCycle: 'MONTHLY',
  isActive: true,
  startDate: '2025-01-01',
  endDate: null,
  cancelledAt: null,
  trialEndsAt: null,
  notes: null,
  paymentMethod: null,
  url: null,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

describe('SubscriptionSummarySection', () => {
  it('displays the number of active subscriptions', () => {
    const subscriptions = [
      makeSubscription({ name: 'Netflix', monthlyCost: 10 }),
      makeSubscription({ name: 'Spotify', monthlyCost: 10 }),
    ];
    render(
      <SubscriptionSummarySection
        currentIncome={500}
        subscriptions={subscriptions}
      />
    );
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('displays the formatted total monthly cost', () => {
    const subscriptions = [
      makeSubscription({ name: 'Netflix', monthlyCost: 15 }),
      makeSubscription({ name: 'Spotify', monthlyCost: 10 }),
    ];
    render(
      <SubscriptionSummarySection
        currentIncome={500}
        subscriptions={subscriptions}
      />
    );
    expect(screen.getByText(/25,00 €/)).toBeInTheDocument();
  });

  it('displays the percentage of income', () => {
    const subscriptions = [
      makeSubscription({ name: 'Netflix', monthlyCost: 50 }),
    ];
    render(
      <SubscriptionSummarySection
        currentIncome={500}
        subscriptions={subscriptions}
      />
    );
    expect(screen.getByText('10.0%')).toBeInTheDocument();
  });

  it('displays a dash for percentage when income is zero', () => {
    const subscriptions = [
      makeSubscription({ name: 'Netflix', monthlyCost: 10 }),
    ];
    render(
      <SubscriptionSummarySection
        currentIncome={0}
        subscriptions={subscriptions}
      />
    );
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('counts active trial subscriptions but excludes them from cost calculations', () => {
    const subscriptions = [
      makeSubscription({ name: 'Netflix', monthlyCost: 10 }),
      makeSubscription({
        name: 'Notion',
        monthlyCost: 20,
        trialEndsAt: '2030-01-01T00:00:00.000Z',
      }),
    ];
    render(
      <SubscriptionSummarySection
        currentIncome={500}
        subscriptions={subscriptions}
      />
    );
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/10,00 €/)).toBeInTheDocument();
    expect(screen.queryByText(/30,00 €/)).not.toBeInTheDocument();
  });

  it('displays zero cost and zero count when there are no subscriptions', () => {
    render(
      <SubscriptionSummarySection currentIncome={500} subscriptions={[]} />
    );
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getAllByText(/0,00 €/).length).toBeGreaterThanOrEqual(2);
  });
});
