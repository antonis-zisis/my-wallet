import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SpendingInsight } from '../../hooks/transactions/selectors/buildSpendingInsights';
import { SpendingInsights } from './SpendingInsights';

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

function renderInsights(insights: Array<SpendingInsight>) {
  return render(
    <SpendingInsights baselineMonths={6} insights={insights} month="2026-08" />
  );
}

describe('SpendingInsights', () => {
  it('names the month and the baseline it compared against', () => {
    renderInsights([makeInsight()]);

    expect(
      screen.getByRole('heading', { name: /what changed in aug '26/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Against your previous 6 months')
    ).toBeInTheDocument();
  });

  it('describes a category that rose above its average', () => {
    renderInsights([makeInsight()]);

    expect(screen.getByText('Dining & Takeaway')).toBeInTheDocument();
    expect(screen.getByText(/72% above your average of/)).toBeInTheDocument();
  });

  it('describes a category that fell below its average', () => {
    renderInsights([
      makeInsight({
        difference: -120,
        direction: 'DECREASE',
        percentageChange: -120 / 180,
        total: 60,
      }),
    ]);

    expect(screen.getByText(/67% below your average of/)).toBeInTheDocument();
  });

  it('says a category is new when there is no baseline spending', () => {
    renderInsights([
      makeInsight({
        baselineAverage: 0,
        category: 'Kids',
        difference: 300,
        percentageChange: null,
        total: 300,
      }),
    ]);

    expect(
      screen.getByText(/nothing spent here in the previous 6 months/)
    ).toBeInTheDocument();
  });

  it('renders a row per insight', () => {
    renderInsights([
      makeInsight(),
      makeInsight({ category: 'Transport' }),
      makeInsight({ category: 'Shopping' }),
    ]);

    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });
});
