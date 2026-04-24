import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SubscriptionCostSummary } from './SubscriptionCostSummary';

describe('SubscriptionCostSummary', () => {
  it('shows skeletons when loading', () => {
    const { container } = render(
      <SubscriptionCostSummary
        activeCount={0}
        loading
        nextRenewal={null}
        totalMonthlyCost={0}
        totalYearlyCost={0}
      />
    );
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0
    );
    expect(screen.queryByText('Monthly cost')).not.toBeInTheDocument();
  });

  it('displays formatted monthly and yearly costs when loaded', () => {
    render(
      <SubscriptionCostSummary
        activeCount={3}
        nextRenewal={null}
        totalMonthlyCost={49.97}
        totalYearlyCost={599.64}
      />
    );
    expect(screen.getByText('Monthly cost')).toBeInTheDocument();
    expect(screen.getByText('Yearly cost')).toBeInTheDocument();
    expect(screen.getByText(/49,97 €/)).toBeInTheDocument();
    expect(screen.getByText(/599,64 €/)).toBeInTheDocument();
  });

  it('shows the active subscription count', () => {
    render(
      <SubscriptionCostSummary
        activeCount={3}
        nextRenewal={null}
        totalMonthlyCost={0}
        totalYearlyCost={0}
      />
    );
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('subscriptions')).toBeInTheDocument();
  });

  it('shows a singular label when there is exactly one subscription', () => {
    render(
      <SubscriptionCostSummary
        activeCount={1}
        nextRenewal={null}
        totalMonthlyCost={0}
        totalYearlyCost={0}
      />
    );
    expect(screen.getByText('subscription')).toBeInTheDocument();
  });

  it('shows a placeholder when there is no upcoming renewal', () => {
    render(
      <SubscriptionCostSummary
        activeCount={0}
        nextRenewal={null}
        totalMonthlyCost={0}
        totalYearlyCost={0}
      />
    );
    expect(screen.getByText('Next renewal')).toBeInTheDocument();
    expect(screen.getByText('No upcoming renewals')).toBeInTheDocument();
  });

  it('shows the next renewal name, amount, and date', () => {
    render(
      <SubscriptionCostSummary
        activeCount={1}
        nextRenewal={{
          amount: 15.99,
          date: new Date('2026-05-10T00:00:00.000Z'),
          name: 'Netflix',
        }}
        totalMonthlyCost={15.99}
        totalYearlyCost={191.88}
      />
    );
    expect(screen.getByText('Next renewal')).toBeInTheDocument();
    expect(screen.getByText(/Netflix · 15,99 €/)).toBeInTheDocument();
  });

  it('renders the Active tile first, followed by Monthly, Yearly, and Next renewal', () => {
    render(
      <SubscriptionCostSummary
        activeCount={2}
        nextRenewal={null}
        totalMonthlyCost={10}
        totalYearlyCost={120}
      />
    );

    const labels = screen
      .getAllByText(/^(Active|Monthly cost|Yearly cost|Next renewal)$/)
      .map((element) => element.textContent);

    expect(labels).toEqual([
      'Active',
      'Monthly cost',
      'Yearly cost',
      'Next renewal',
    ]);
  });
});
