import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SubscriptionCostSummary } from './SubscriptionCostSummary';

const defaultProps = {
  mostExpensive: null,
  nextRenewal: null,
  renewingThisMonthTotal: 0,
  totalMonthlyCost: 0,
  totalYearlyCost: 0,
};

describe('SubscriptionCostSummary', () => {
  it('shows skeletons when loading', () => {
    const { container } = render(
      <SubscriptionCostSummary {...defaultProps} loading />
    );
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0
    );
    expect(screen.queryByText('Monthly cost')).not.toBeInTheDocument();
  });

  it('displays formatted monthly and yearly costs when loaded', () => {
    render(
      <SubscriptionCostSummary
        {...defaultProps}
        totalMonthlyCost={49.97}
        totalYearlyCost={599.64}
      />
    );
    expect(screen.getByText('Monthly cost')).toBeInTheDocument();
    expect(screen.getByText('Yearly cost')).toBeInTheDocument();
    expect(screen.getByText(/49,97 €/)).toBeInTheDocument();
    expect(screen.getByText(/599,64 €/)).toBeInTheDocument();
  });

  it('shows a placeholder when there is no upcoming renewal', () => {
    render(<SubscriptionCostSummary {...defaultProps} />);
    expect(screen.getByText('Next renewal')).toBeInTheDocument();
    expect(screen.getByText('No upcoming renewals')).toBeInTheDocument();
  });

  it('shows the next renewal name, amount, and date in the label', () => {
    render(
      <SubscriptionCostSummary
        {...defaultProps}
        nextRenewal={{
          amount: 15.99,
          date: new Date('2026-05-10T00:00:00.000Z'),
          name: 'Netflix',
        }}
        totalMonthlyCost={15.99}
        totalYearlyCost={191.88}
      />
    );
    expect(screen.getByText(/Next renewal · /)).toBeInTheDocument();
    expect(screen.getByText(/Netflix · 15,99 €/)).toBeInTheDocument();
  });

  it('shows the most expensive subscription with cost in the label and name as primary', () => {
    render(
      <SubscriptionCostSummary
        {...defaultProps}
        mostExpensive={{ monthlyCost: 19.99, name: 'Spotify' }}
        totalMonthlyCost={19.99}
        totalYearlyCost={239.88}
      />
    );
    expect(
      screen.getByText(/Most expensive · 19,99 € \/ mo/)
    ).toBeInTheDocument();
    expect(screen.getByText('Spotify')).toBeInTheDocument();
  });

  it('shows renewing this month total', () => {
    render(
      <SubscriptionCostSummary
        {...defaultProps}
        renewingThisMonthTotal={45.97}
      />
    );
    expect(screen.getByText('Renewing this month')).toBeInTheDocument();
    expect(screen.getByText(/45,97 €/)).toBeInTheDocument();
  });

  it('shows a placeholder when nothing renews this month', () => {
    render(<SubscriptionCostSummary {...defaultProps} />);
    expect(screen.getByText('Renewing this month')).toBeInTheDocument();
    expect(screen.getByText('Nothing due')).toBeInTheDocument();
  });

  it('renders tiles in order: Monthly, Yearly, Most expensive, Next renewal, Renewing this month', () => {
    render(<SubscriptionCostSummary {...defaultProps} />);

    const labels = screen
      .getAllByText(
        /^(Monthly cost|Yearly cost|Most expensive|Next renewal|Renewing this month)$/
      )
      .map((element) => element.textContent);

    expect(labels).toEqual([
      'Monthly cost',
      'Yearly cost',
      'Most expensive', // label when mostExpensive is null
      'Next renewal',
      'Renewing this month',
    ]);
  });
});
