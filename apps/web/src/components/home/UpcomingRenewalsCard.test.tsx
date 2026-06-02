import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { makeSubscription } from '../../test/fixtures/subscription';
import { UpcomingRenewalsCard } from './UpcomingRenewalsCard';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-04-06'));
});

afterEach(() => {
  vi.useRealTimers();
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
          id: 'netflix',
          name: 'Netflix',
          startDate: '2024-04-10',
          amount: 15,
          monthlyCost: 15,
        }),
        makeSubscription({
          id: 'spotify',
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
      // With today = 2026-04-06, MONTHLY subscriptions renew on day of startDate.
      const subscriptions = [
        makeSubscription({
          id: 'a',
          name: 'Renews April 20',
          startDate: '2024-04-20',
        }),
        makeSubscription({
          id: 'b',
          name: 'Renews April 10',
          startDate: '2024-04-10',
        }),
        makeSubscription({
          id: 'c',
          name: 'Renews April 15',
          startDate: '2024-04-15',
        }),
      ];

      render(<UpcomingRenewalsCard subscriptions={subscriptions} />);

      const items = screen.getAllByText(/Renews April/);
      expect(items[0]).toHaveTextContent('Renews April 10');
      expect(items[1]).toHaveTextContent('Renews April 15');
      expect(items[2]).toHaveTextContent('Renews April 20');
    });

    it('shows at most 5 subscriptions and filters those beyond 40 days', () => {
      const within40Days = Array.from({ length: 7 }, (_, index) =>
        makeSubscription({
          id: `near-${index}`,
          name: `Near ${index + 1}`,
          startDate: `2024-04-${String(index + 7).padStart(2, '0')}`,
        })
      );
      const farAway = makeSubscription({
        id: 'far',
        name: 'Far Away',
        startDate: '2024-09-01',
        billingCycle: 'YEARLY',
      });

      render(
        <UpcomingRenewalsCard subscriptions={[...within40Days, farAway]} />
      );

      expect(screen.getAllByText(/^Near \d+$/)).toHaveLength(5);
      expect(screen.queryByText('Far Away')).not.toBeInTheDocument();
    });

    it('shows empty state when no subscriptions renew within 40 days', () => {
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

    it('collapses and expands when the toggle button is clicked', () => {
      const subscriptions = [
        makeSubscription({ name: 'Netflix', startDate: '2024-04-10' }),
      ];

      render(<UpcomingRenewalsCard subscriptions={subscriptions} />);
      const button = screen.getByRole('button', { name: /upcoming renewals/i });

      expect(button).toHaveAttribute('aria-expanded', 'true');

      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
