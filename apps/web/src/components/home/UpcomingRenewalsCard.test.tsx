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
  cancelledAt: null,
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

    it('shows billing cycle label as muted text', () => {
      const subscriptions = [
        makeSubscription({
          name: 'Netflix',
          startDate: '2024-04-10',
          billingCycle: 'MONTHLY',
        }),
        makeSubscription({
          name: 'Spotify',
          startDate: '2024-04-15',
          billingCycle: 'YEARLY',
        }),
      ];
      render(<UpcomingRenewalsCard subscriptions={subscriptions} />);
      expect(screen.getByText('Monthly')).toBeInTheDocument();
      expect(screen.getByText('Yearly')).toBeInTheDocument();
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

    it('filters out subscriptions renewing more than 40 days away', () => {
      // Today is 2026-04-06; April 10 (monthly) is within 40 days,
      // September 1 (yearly from 2024) renews Sep 1 2026 — 148 days away
      const subscriptions = [
        makeSubscription({ name: 'Soon', startDate: '2024-04-10' }),
        makeSubscription({
          name: 'Far Away',
          startDate: '2024-09-01',
          billingCycle: 'YEARLY',
        }),
      ];
      render(<UpcomingRenewalsCard subscriptions={subscriptions} />);
      expect(screen.getByText('Soon')).toBeInTheDocument();
      expect(screen.queryByText('Far Away')).not.toBeInTheDocument();
    });

    it('shows empty state when no subscriptions renew within 40 days', () => {
      // September 1 (yearly from 2024) renews Sep 1 2026 — 148 days away
      const subscriptions = [
        makeSubscription({
          name: 'Far Away',
          startDate: '2024-09-01',
          billingCycle: 'YEARLY',
        }),
      ];
      render(<UpcomingRenewalsCard subscriptions={subscriptions} />);
      expect(
        screen.getByText('No renewals due in the next 40 days.')
      ).toBeInTheDocument();
    });

    describe('urgency labels', () => {
      it('shows "Today" when renewal is today', () => {
        // startDate renews on the 6th; today is 2026-04-06
        const subscriptions = [
          makeSubscription({ name: 'Netflix', startDate: '2024-04-06' }),
        ];
        render(<UpcomingRenewalsCard subscriptions={subscriptions} />);
        expect(screen.getByText(/Today/)).toBeInTheDocument();
      });

      it('shows "Tomorrow" when renewal is tomorrow', () => {
        const subscriptions = [
          makeSubscription({ name: 'Netflix', startDate: '2024-04-07' }),
        ];
        render(<UpcomingRenewalsCard subscriptions={subscriptions} />);
        expect(screen.getByText(/Tomorrow/)).toBeInTheDocument();
      });

      it('shows "in Xd" for renewals further away', () => {
        // startDate renews on the 16th; today is the 6th → 10 days
        const subscriptions = [
          makeSubscription({ name: 'Netflix', startDate: '2024-04-16' }),
        ];
        render(<UpcomingRenewalsCard subscriptions={subscriptions} />);
        expect(screen.getByText(/in 10d/)).toBeInTheDocument();
      });
    });

    it('is expanded by default', () => {
      const subscriptions = [
        makeSubscription({ name: 'Netflix', startDate: '2024-04-10' }),
      ];
      render(<UpcomingRenewalsCard subscriptions={subscriptions} />);
      expect(
        screen.getByRole('button', { name: /upcoming renewals/i })
      ).toHaveAttribute('aria-expanded', 'true');
    });

    it('collapses when the toggle button is clicked', () => {
      const subscriptions = [
        makeSubscription({ name: 'Netflix', startDate: '2024-04-10' }),
      ];
      render(<UpcomingRenewalsCard subscriptions={subscriptions} />);
      fireEvent.click(
        screen.getByRole('button', { name: /upcoming renewals/i })
      );
      expect(
        screen.getByRole('button', { name: /upcoming renewals/i })
      ).toHaveAttribute('aria-expanded', 'false');
    });

    it('expands again on a second click', () => {
      const subscriptions = [
        makeSubscription({ name: 'Netflix', startDate: '2024-04-10' }),
      ];
      render(<UpcomingRenewalsCard subscriptions={subscriptions} />);
      const button = screen.getByRole('button', { name: /upcoming renewals/i });
      fireEvent.click(button);
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
