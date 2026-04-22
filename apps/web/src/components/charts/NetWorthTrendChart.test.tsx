import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from '../../contexts/ThemeContext';
import { NetWorthTrendChart } from './NetWorthTrendChart';

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(private callback: ResizeObserverCallback) {}
      observe(target: Element) {
        this.callback(
          [
            {
              contentRect: { width: 800, height: 260 },
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

const makeSnapshot = (overrides: {
  id: string;
  title: string;
  netWorth: number;
  createdAt: string;
}) => overrides;

const renderChart = (snapshots: Array<ReturnType<typeof makeSnapshot>>) =>
  render(
    <MemoryRouter>
      <ThemeProvider>
        <NetWorthTrendChart snapshots={snapshots} />
      </ThemeProvider>
    </MemoryRouter>
  );

describe('NetWorthTrendChart', () => {
  it('renders nothing when there are fewer than 2 snapshots', () => {
    const { container } = renderChart([
      makeSnapshot({
        id: '1',
        title: 'January 2026',
        netWorth: 1000,
        createdAt: '2026-01-01T00:00:00Z',
      }),
    ]);
    expect(container.innerHTML).toBe('');
  });

  it('renders a chart when two or more snapshots are provided', () => {
    const { container } = renderChart([
      makeSnapshot({
        id: '1',
        title: 'January 2026',
        netWorth: 1000,
        createdAt: '2026-01-01T00:00:00Z',
      }),
      makeSnapshot({
        id: '2',
        title: 'February 2026',
        netWorth: 2000,
        createdAt: '2026-02-01T00:00:00Z',
      }),
    ]);
    expect(container.querySelector('.recharts-wrapper')).toBeInTheDocument();
  });

  it('sorts snapshots by date ascending on the X-axis', () => {
    const { getByText } = renderChart([
      makeSnapshot({
        id: '2',
        title: 'February 2026',
        netWorth: 2000,
        createdAt: '2026-02-01T00:00:00Z',
      }),
      makeSnapshot({
        id: '1',
        title: 'January 2026',
        netWorth: 1000,
        createdAt: '2026-01-01T00:00:00Z',
      }),
    ]);
    expect(getByText("Jan '26")).toBeInTheDocument();
    expect(getByText("Feb '26")).toBeInTheDocument();
  });
});
