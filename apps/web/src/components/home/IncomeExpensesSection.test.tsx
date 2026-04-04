import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { Report } from '../../types/report';
import { IncomeExpensesSection } from './IncomeExpensesSection';

const mockReport: Report = {
  id: '1',
  title: 'Jan',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function renderSection(props: { reports?: Array<Report>; loading?: boolean }) {
  return render(
    <MemoryRouter>
      <IncomeExpensesSection
        loading={props.loading ?? false}
        reports={props.reports ?? []}
      />
    </MemoryRouter>
  );
}

describe('IncomeExpensesSection', () => {
  it('shows skeleton when loading', () => {
    const { container } = renderSection({ loading: true });
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0
    );
    expect(screen.queryByText('Income & Expenses')).not.toBeInTheDocument();
  });

  it('shows CTA placeholder when not loading and no reports', () => {
    renderSection({ loading: false, reports: [] });
    expect(screen.getByText('No reports yet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Add a report' })).toHaveAttribute(
      'href',
      '/reports'
    );
  });

  it('shows Income & Expenses heading when reports exist', () => {
    renderSection({ loading: false, reports: [mockReport] });
    expect(screen.getByText('Income & Expenses')).toBeInTheDocument();
  });
});
