import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Report } from '../../types/report';
import { ReportCard } from './ReportCard';

const mockReport: Report = {
  id: '1',
  title: 'January 2026',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-15T00:00:00.000Z',
  transactions: [
    {
      id: 't1',
      reportId: '1',
      type: 'INCOME',
      amount: 2500,
      description: 'Salary',
      category: 'Salary',
      date: '2026-01-05',
      createdAt: '2026-01-05T00:00:00.000Z',
      updatedAt: '2026-01-05T00:00:00.000Z',
    },
    {
      id: 't2',
      reportId: '1',
      type: 'EXPENSE',
      amount: 150.5,
      description: 'Groceries',
      category: 'Food',
      date: '2026-01-10',
      createdAt: '2026-01-10T00:00:00.000Z',
      updatedAt: '2026-01-10T00:00:00.000Z',
    },
    {
      id: 't3',
      reportId: '1',
      type: 'EXPENSE',
      amount: 50,
      description: 'Transport',
      category: 'Transport',
      date: '2026-01-12',
      createdAt: '2026-01-12T00:00:00.000Z',
      updatedAt: '2026-01-12T00:00:00.000Z',
    },
  ],
};

describe('ReportCard', () => {
  it('renders the report title and label', () => {
    render(<ReportCard label="Current" report={mockReport} />);

    expect(screen.getByText('January 2026')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
  });

  it('displays formatted income total', () => {
    render(<ReportCard label="Current" report={mockReport} />);

    expect(screen.getByText(/2\.500,00/)).toBeInTheDocument();
  });

  it('displays formatted expense total', () => {
    render(<ReportCard label="Current" report={mockReport} />);

    expect(screen.getByText(/200,50/)).toBeInTheDocument();
  });

  it('handles a report with no transactions', () => {
    const emptyReport: Report = {
      id: '2',
      title: 'Empty Report',
      createdAt: '2026-02-01T00:00:00.000Z',
      updatedAt: '2026-02-01T00:00:00.000Z',
    };

    render(<ReportCard label="Previous" report={emptyReport} />);

    expect(screen.getByText('Empty Report')).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getAllByText(/0,00/)).toHaveLength(2);
  });
});
