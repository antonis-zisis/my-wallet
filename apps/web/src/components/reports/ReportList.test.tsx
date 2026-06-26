import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { makeReport } from '../../test/fixtures/report';
import { Report } from '../../types/report';
import { ReportList } from './ReportList';

const mockReports: Array<Report> = [
  makeReport({
    id: '1',
    title: 'January Budget',
    netBalance: 500,
    transactionCount: 3,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  }),
  makeReport({
    id: '2',
    title: 'February Budget',
    netBalance: -100,
    transactionCount: 1,
    createdAt: '2024-02-01T00:00:00.000Z',
    updatedAt: '2024-02-01T00:00:00.000Z',
  }),
];

const renderReportList = (props: {
  error: boolean;
  isSearching?: boolean;
  loading: boolean;
  onCreateReport?: () => void;
  reports: Array<Report>;
}) => {
  return render(
    <MemoryRouter>
      <ReportList {...props} />
    </MemoryRouter>
  );
};

describe('ReportList', () => {
  it('shows loading state', () => {
    renderReportList({ error: false, loading: true, reports: [] });
    expect(screen.getByTestId('report-list-skeleton')).toBeInTheDocument();
  });

  it('shows error state', () => {
    renderReportList({ error: true, loading: false, reports: [] });
    expect(screen.getByText('Failed to load reports.')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    renderReportList({ error: false, loading: false, reports: [] });
    expect(screen.getByText('No reports yet')).toBeInTheDocument();
  });

  it('shows a no-matches state instead of the empty state while searching', () => {
    renderReportList({
      error: false,
      isSearching: true,
      loading: false,
      reports: [],
    });

    expect(
      screen.getByText('No reports match your search')
    ).toBeInTheDocument();
    expect(screen.queryByText('No reports yet')).not.toBeInTheDocument();
  });

  it('shows create button in empty state when onCreateReport is provided', () => {
    const onCreateReport = vi.fn();
    renderReportList({
      error: false,
      loading: false,
      onCreateReport,
      reports: [],
    });
    expect(
      screen.getByRole('button', { name: 'Create your first report' })
    ).toBeInTheDocument();
  });

  it('renders report titles as links', () => {
    renderReportList({ error: false, loading: false, reports: mockReports });

    const link1 = screen.getByText('January Budget').closest('a');
    const link2 = screen.getByText('February Budget').closest('a');

    expect(link1).toHaveAttribute('href', '/reports/1');
    expect(link2).toHaveAttribute('href', '/reports/2');
  });

  it('displays relative updated time', () => {
    renderReportList({ error: false, loading: false, reports: mockReports });
    expect(screen.getAllByText(/Jan 1, 2024/).length).toBeGreaterThan(0);
  });

  it('displays plural transaction count', () => {
    renderReportList({ error: false, loading: false, reports: mockReports });
    expect(screen.getByText(/3 transactions/)).toBeInTheDocument();
  });

  it('displays singular transaction count', () => {
    renderReportList({ error: false, loading: false, reports: mockReports });
    expect(screen.getByText(/1 transaction\b/)).toBeInTheDocument();
  });

  it('displays positive net balance with a plus sign', () => {
    renderReportList({ error: false, loading: false, reports: mockReports });
    expect(screen.getByText(/\+500/)).toBeInTheDocument();
  });

  it('displays negative net balance with a minus sign', () => {
    renderReportList({ error: false, loading: false, reports: mockReports });
    expect(screen.getByText(/-100/)).toBeInTheDocument();
  });
});
