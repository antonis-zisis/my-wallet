import { fireEvent, render, screen } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { type Subscription } from '../../types/subscription';
import { UpcomingRenewalsCard } from './UpcomingRenewalsCard';

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-04-06'));
});

afterAll(() => {
  vi.useRealTimers();
});

const makeSubscription = (
  overrides: Partial<Subscription> & Pick<Subscription, 'name' | 'startDate'>
): Subscription => ({
  id: crypto.randomUUID(),
  amount: 10,
  billingCycle: 'MONTHLY',
  isActive: true,
  endDate: null,
  monthlyCost: 10,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

describe('UpcomingRenewalsCard', () => {
  describe('loading state', () => {
    it('shows a skeleton and hides the Upcoming Renewals heading', () => {
      const { container } = render(
        <UpcomingRenewalsCard loading subscriptions={[]} />
      );
      expect(
        container.querySelectorAll('.animate-pulse').length
      ).toBeGreaterThan(0);
      expect(screen.queryByText('Upcoming Renewals')).not.toBeInTheDocument();
    });
  });

  describe('loaded state', () => {
    it('renders subscription names and amounts', () => {
      const subscriptions = [
        makeSubscription({
          name: 'Netflix',
          startDate: '2024-04-10',
          amount: 15,
          monthlyCost: 15,
        }),
        makeSubscription({
          name: 'Spotify',
          startDate: '2024-04-20',
          amount: 9,
          monthlyCost: 9,
        }),
      ];
      render(<UpcomingRenewalsCard subscriptions={subscriptions} />);
      expect(screen.getByText('Netflix')).toBeInTheDocument();
      expect(screen.getByText('Spotify')).toBeInTheDocument();
      expect(screen.getByText(/15,00 €/)).toBeInTheDocument();
      expect(screen.getByText(/9,00 €/)).toBeInTheDocument();
    });

    it('sorts subscriptions by next renewal date ascending', () => {
      // With today = 2026-04-06, MONTHLY subscriptions renew on day of startDate:
      // "2024-04-20" → April 20, "2024-04-10" → April 10, "2024-04-15" → April 15
      // Expected order: April 10, April 15, April 20
      const subscriptions = [
        makeSubscription({ name: 'Renews April 20', startDate: '2024-04-20' }),
        makeSubscription({ name: 'Renews April 10', startDate: '2024-04-10' }),
        makeSubscription({ name: 'Renews April 15', startDate: '2024-04-15' }),
      ];
      render(<UpcomingRenewalsCard subscriptions={subscriptions} />);
      const items = screen.getAllByText(/Renews April/);
      expect(items[0]).toHaveTextContent('Renews April 10');
      expect(items[1]).toHaveTextContent('Renews April 15');
      expect(items[2]).toHaveTextContent('Renews April 20');
    });

    it('shows at most 5 subscriptions', () => {
      const subscriptions = Array.from({ length: 7 }, (_, index) =>
        makeSubscription({
          name: `Sub ${index + 1}`,
          startDate: `2024-04-${String(index + 7).padStart(2, '0')}`,
        })
      );
      render(<UpcomingRenewalsCard subscriptions={subscriptions} />);
      expect(screen.getAllByText(/^Sub \d+$/)).toHaveLength(5);
    });

    it('is expanded by default', () => {
      const subscriptions = [
        makeSubscription({ name: 'Netflix', startDate: '2024-04-10' }),
      ];
      render(<UpcomingRenewalsCard subscriptions={subscriptions} />);
      expect(screen.getByText('Netflix')).toBeVisible();
    });

    it('collapses when the toggle button is clicked', () => {
      const subscriptions = [
        makeSubscription({ name: 'Netflix', startDate: '2024-04-10' }),
      ];
      render(<UpcomingRenewalsCard subscriptions={subscriptions} />);
      fireEvent.click(
        screen.getByRole('button', { name: /upcoming renewals/i })
      );
      expect(screen.queryByText('Netflix')).not.toBeInTheDocument();
    });

    it('expands again on a second click', () => {
      const subscriptions = [
        makeSubscription({ name: 'Netflix', startDate: '2024-04-10' }),
      ];
      render(<UpcomingRenewalsCard subscriptions={subscriptions} />);
      const button = screen.getByRole('button', { name: /upcoming renewals/i });
      fireEvent.click(button);
      fireEvent.click(button);
      expect(screen.getByText('Netflix')).toBeVisible();
    });
  });
});
