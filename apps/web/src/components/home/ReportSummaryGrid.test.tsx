import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Report } from '../../types/report';
import { ReportSummaryGrid } from './ReportSummaryGrid';

const mockReport: Report = {
  id: '1',
  title: 'January 2026',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  transactions: [],
};

function renderGrid(overrides = {}) {
  return render(
    <ReportSummaryGrid
      currentLoading={false}
      currentReport={undefined}
      previousLoading={false}
      previousReport={undefined}
      reportsLoading={false}
      totalCount={undefined}
      {...overrides}
    />
  );
}

describe('ReportSummaryGrid', () => {
  it('shows skeleton for Total Reports card when reportsLoading is true', () => {
    const { container } = renderGrid({ reportsLoading: true });
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0
    );
    expect(screen.queryByText('-')).not.toBeInTheDocument();
  });

  it('shows dash for Total Reports when not loading and count is undefined', () => {
    renderGrid({ reportsLoading: false });
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('shows total count when loaded', () => {
    renderGrid({ reportsLoading: false, totalCount: 5 });
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows skeleton for current card when currentLoading is true', () => {
    const { container } = renderGrid({ currentLoading: true });
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0
    );
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('shows skeleton for previous card when previousLoading is true', () => {
    const { container } = renderGrid({ previousLoading: true });
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0
    );
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('shows placeholder text when no current report and not loading', () => {
    renderGrid({ currentLoading: false, currentReport: undefined });
    expect(
      screen.getAllByText('Add a report to view summary').length
    ).toBeGreaterThan(0);
  });

  it('shows report card when current report is provided', () => {
    renderGrid({ currentLoading: false, currentReport: mockReport });
    expect(screen.getByText('January 2026')).toBeInTheDocument();
  });
});
