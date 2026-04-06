import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { type Report } from '../../types/report';
import { IncomeExpensesChart } from './IncomeExpensesChart';

// ResponsiveContainer uses ResizeObserver to get dimensions before rendering
// its children. In jsdom there is no layout engine, so we mock it to
// immediately report a fixed size, ensuring the chart renders fully.
beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(private callback: ResizeObserverCallback) {}
      observe(target: Element) {
        this.callback(
          [
            {
              contentRect: { width: 800, height: 300 },
              target,
            } as ResizeObserverEntry,
          ],
          this as unknown as ResizeObserver
        );
      }
      unobserve() {}
      disconnect() {}
    }
  );
});

const makeReport = (
  overrides: Partial<Report> & Pick<Report, 'title'>
): Report => ({
  id: crypto.randomUUID(),
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  transactions: [],
  ...overrides,
});

const renderChart = (props: React.ComponentProps<typeof IncomeExpensesChart>) =>
  render(
    <MemoryRouter>
      <IncomeExpensesChart {...props} />
    </MemoryRouter>
  );

describe('IncomeExpensesChart', () => {
  it('renders nothing when there are no reports', () => {
    const { container } = renderChart({ reports: [] });
    expect(container.innerHTML).toBe('');
  });

  it('renders a chart when reports are provided', () => {
    const reports = [makeReport({ title: 'January 2026' })];
    const { container } = renderChart({ reports });
    expect(container.querySelector('.recharts-wrapper')).toBeInTheDocument();
  });

  it('respects the limit prop', () => {
    const reports = Array.from({ length: 6 }, (_, index) =>
      makeReport({ title: `Month ${index + 1}` })
    );
    const { container } = renderChart({ reports, limit: 3 });
    const ticks = container.querySelectorAll(
      '.recharts-xAxis .recharts-cartesian-axis-tick'
    );
    expect(ticks).toHaveLength(3);
  });

  it('truncates titles longer than 14 characters', () => {
    const reports = [makeReport({ title: 'A Very Long Report Title' })];
    const { getByText } = renderChart({ reports });
    expect(getByText('A Very Long Re…')).toBeInTheDocument();
  });
});
