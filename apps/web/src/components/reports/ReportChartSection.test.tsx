import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ReportChartSection } from './ReportChartSection';

const defaultProps = {
  isOpen: true,
  title: 'Expense Breakdown',
  onToggle: vi.fn(),
};

describe('ReportChartSection', () => {
  it('renders the section title', () => {
    render(<ReportChartSection {...defaultProps}>chart</ReportChartSection>);
    expect(screen.getByText('Expense Breakdown')).toBeInTheDocument();
  });

  it('shows children when isOpen is true', () => {
    render(
      <ReportChartSection {...defaultProps} isOpen>
        <div>Chart content</div>
      </ReportChartSection>
    );
    expect(screen.getByText('Chart content')).toBeInTheDocument();
  });

  it('hides children when isOpen is false', () => {
    render(
      <ReportChartSection {...defaultProps} isOpen={false}>
        <div>Chart content</div>
      </ReportChartSection>
    );
    expect(screen.queryByText('Chart content')).not.toBeInTheDocument();
  });

  it('sets aria-expanded to true when open', () => {
    render(
      <ReportChartSection {...defaultProps} isOpen>
        chart
      </ReportChartSection>
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });

  it('sets aria-expanded to false when closed', () => {
    render(
      <ReportChartSection {...defaultProps} isOpen={false}>
        chart
      </ReportChartSection>
    );
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  it('calls onToggle when the header button is clicked', async () => {
    const onToggle = vi.fn();
    render(
      <ReportChartSection {...defaultProps} onToggle={onToggle}>
        chart
      </ReportChartSection>
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalled();
  });
});
