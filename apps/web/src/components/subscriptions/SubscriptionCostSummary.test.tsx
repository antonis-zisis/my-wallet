import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SubscriptionCostSummary } from './SubscriptionCostSummary';

describe('SubscriptionCostSummary', () => {
  it('shows skeletons when loading', () => {
    const { container } = render(
      <SubscriptionCostSummary
        loading
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
        totalMonthlyCost={49.97}
        totalYearlyCost={599.64}
      />
    );
    expect(screen.getByText('Monthly cost')).toBeInTheDocument();
    expect(screen.getByText('Yearly cost')).toBeInTheDocument();
    expect(screen.getByText(/49,97 €/)).toBeInTheDocument();
    expect(screen.getByText(/599,64 €/)).toBeInTheDocument();
  });
});
