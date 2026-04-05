import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { Report } from '../../types/report';
import { ReportList } from './ReportList';

const mockReports: Array<Report> = [
  {
    id: '1',
    title: 'January Budget',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    title: 'February Budget',
    createdAt: '2024-02-01T00:00:00.000Z',
    updatedAt: '2024-02-01T00:00:00.000Z',
  },
];

const renderReportList = (props: {
  error: boolean;
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
    expect(screen.getAllByText('Jan 1, 2024').length).toBeGreaterThan(0);
  });
});
