import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

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
  reports: Array<Report>;
  loading: boolean;
  error: boolean;
}) => {
  return render(
    <MemoryRouter>
      <ReportList {...props} />
    </MemoryRouter>
  );
};

describe('ReportList', () => {
  it('shows loading state', () => {
    renderReportList({ reports: [], loading: true, error: false });
    expect(screen.getByText('Loading reports...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    renderReportList({ reports: [], loading: false, error: true });
    expect(screen.getByText('Failed to load reports.')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    renderReportList({ reports: [], loading: false, error: false });
    expect(
      screen.getByText('No reports yet. Create your first one!')
    ).toBeInTheDocument();
  });

  it('renders report titles as links', () => {
    renderReportList({ reports: mockReports, loading: false, error: false });

    const link1 = screen.getByText('January Budget').closest('a');
    const link2 = screen.getByText('February Budget').closest('a');

    expect(link1).toHaveAttribute('href', '/reports/1');
    expect(link2).toHaveAttribute('href', '/reports/2');
  });

  it('displays creation dates', () => {
    renderReportList({ reports: mockReports, loading: false, error: false });
    expect(screen.getByText('01/01/2024')).toBeInTheDocument();
    expect(screen.getByText('01/02/2024')).toBeInTheDocument();
  });
});
