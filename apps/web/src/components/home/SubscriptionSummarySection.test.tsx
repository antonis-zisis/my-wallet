import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { makeSubscription } from '../../test/fixtures/subscription';
import { SubscriptionSummarySection } from './SubscriptionSummarySection';

describe('SubscriptionSummarySection', () => {
  it('shows count, monthly cost, and percent of income for paid subscriptions', () => {
    const subscriptions = [
      makeSubscription({
        id: 'netflix',
        name: 'Netflix',
        amount: 15,
        monthlyCost: 15,
      }),
      makeSubscription({
        id: 'spotify',
        name: 'Spotify',
        amount: 10,
        monthlyCost: 10,
      }),
    ];

    render(
      <SubscriptionSummarySection
        currentIncome={500}
        subscriptions={subscriptions}
      />
    );

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/25,00 €/)).toBeInTheDocument();
    expect(screen.getByText('5.0%')).toBeInTheDocument();
  });

  it('counts trial subscriptions but excludes them from cost', () => {
    const subscriptions = [
      makeSubscription({
        id: 'netflix',
        name: 'Netflix',
        amount: 10,
        monthlyCost: 10,
      }),
      makeSubscription({
        id: 'notion',
        name: 'Notion',
        amount: 20,
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

  it('displays a dash for percent of income when income is zero', () => {
    render(
      <SubscriptionSummarySection
        currentIncome={0}
        subscriptions={[makeSubscription({ name: 'Netflix' })]}
      />
    );

    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('displays zero cost and zero count when there are no subscriptions', () => {
    render(
      <SubscriptionSummarySection currentIncome={500} subscriptions={[]} />
    );

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getAllByText(/0,00 €/).length).toBeGreaterThanOrEqual(2);
  });
});
