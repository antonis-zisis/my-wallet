import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { SpendingInsight } from '../../hooks/transactions/selectors/buildSpendingInsights';
import { MonthlyInsightsGrid } from './MonthlyInsightsGrid';

const insight: SpendingInsight = {
  baselineAverage: 180,
  category: 'Dining & Takeaway',
  difference: 130,
  direction: 'INCREASE',
  percentageChange: 130 / 180,
  total: 310,
};

type RenderGridOverrides = Partial<Parameters<typeof MonthlyInsightsGrid>[0]>;

function renderGrid(overrides: RenderGridOverrides = {}) {
  return render(
    <MemoryRouter>
      <MonthlyInsightsGrid
        baselineMonths={6}
        insight={insight}
        insightMonth="2026-08"
        loading={false}
        savingsRate={92}
        savingsRateReportTitle="January 2026"
        {...overrides}
      />
    </MemoryRouter>
  );
}

describe('MonthlyInsightsGrid', () => {
  it('renders both the biggest change and the savings rate', () => {
    renderGrid();

    expect(
      screen.getByRole('heading', { name: /biggest change in aug '26/i })
    ).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
  });

  it('shows placeholders while the data is loading', () => {
    const { container } = renderGrid({ loading: true });

    expect(
      screen.queryByRole('heading', { name: /biggest change/i })
    ).not.toBeInTheDocument();
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0
    );
  });

  it('renders the biggest change alone when there is no savings rate', () => {
    renderGrid({ savingsRate: null, savingsRateReportTitle: null });

    expect(
      screen.getByRole('heading', { name: /biggest change/i })
    ).toBeInTheDocument();
    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
  });

  it('renders the savings rate alone when there is no insight', () => {
    renderGrid({ insight: null, insightMonth: null });

    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /biggest change/i })
    ).not.toBeInTheDocument();
  });

  it('renders nothing when there is neither', () => {
    const { container } = renderGrid({
      insight: null,
      insightMonth: null,
      savingsRate: null,
      savingsRateReportTitle: null,
    });

    expect(container).toBeEmptyDOMElement();
  });
});
