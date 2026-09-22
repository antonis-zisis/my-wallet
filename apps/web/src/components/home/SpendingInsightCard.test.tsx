import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { SpendingInsight } from '../../hooks/transactions/selectors/buildSpendingInsights';
import { SpendingInsightCard } from './SpendingInsightCard';

function makeInsight(
  overrides: Partial<SpendingInsight> = {}
): SpendingInsight {
  return {
    baselineAverage: 180,
    category: 'Dining & Takeaway',
    difference: 130,
    direction: 'INCREASE',
    percentageChange: 130 / 180,
    total: 310,
    ...overrides,
  };
}

function renderCard(insight = makeInsight()) {
  return render(
    <MemoryRouter>
      <SpendingInsightCard
        baselineMonths={6}
        insight={insight}
        month="2026-08"
      />
    </MemoryRouter>
  );
}

describe('SpendingInsightCard', () => {
  it('names the month and the category that moved most', () => {
    renderCard();

    expect(
      screen.getByRole('heading', { name: /biggest change in aug '26/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Dining & Takeaway')).toBeInTheDocument();
  });

  it('names the baseline the change is measured against', () => {
    renderCard();

    expect(
      screen.getByText('Against your previous 6 months')
    ).toBeInTheDocument();
  });

  it('describes a category that rose above its average', () => {
    renderCard();

    expect(screen.getByText(/130,00/)).toBeInTheDocument();
    expect(screen.getByText('above average')).toBeInTheDocument();
  });

  it('describes a category that fell below its average', () => {
    renderCard(
      makeInsight({
        difference: -120,
        direction: 'DECREASE',
        percentageChange: -120 / 180,
        total: 60,
      })
    );

    expect(screen.getByText(/120,00/)).toBeInTheDocument();
    expect(screen.getByText('below average')).toBeInTheDocument();
  });

  it('says a category is new when there is no baseline spending', () => {
    renderCard(
      makeInsight({
        baselineAverage: 0,
        category: 'Kids',
        difference: 300,
        percentageChange: null,
        total: 300,
      })
    );

    expect(screen.getByText(/nothing spent here before/)).toBeInTheDocument();
  });

  it('links through to the full category trends', () => {
    renderCard();

    expect(
      screen.getByRole('link', { name: 'See all trends' })
    ).toHaveAttribute('href', '/reports/trends');
  });
});
