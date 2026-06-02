import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { makeReport, makeTransaction } from '../../test/fixtures/report';
import { ReportCard } from './ReportCard';

const populatedReport = makeReport({
  id: '1',
  title: 'January 2026',
  transactions: [
    makeTransaction({
      id: 't1',
      type: 'INCOME',
      amount: 2500,
      category: 'Salary',
    }),
    makeTransaction({ id: 't2', type: 'EXPENSE', amount: 150.5 }),
    makeTransaction({ id: 't3', type: 'EXPENSE', amount: 50 }),
  ],
});

function renderCard(report = populatedReport) {
  return render(
    <MemoryRouter>
      <ReportCard label="Current" report={report} />
    </MemoryRouter>
  );
}

describe('ReportCard', () => {
  it('renders the title, label, and income and expense totals, linking to the report', () => {
    renderCard();

    expect(screen.getByText('January 2026')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
    expect(screen.getByText(/2\.500,00/)).toBeInTheDocument();
    expect(screen.getByText(/200,50/)).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/reports/1');
  });

  it('renders zero totals for a report with no transactions', () => {
    const emptyReport = makeReport({ id: '2', title: 'Empty Report' });

    renderCard(emptyReport);

    expect(screen.getByText('Empty Report')).toBeInTheDocument();
    expect(screen.getAllByText(/0,00/)).toHaveLength(2);
  });
});
