import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { makeSubscription } from '../../test/fixtures/subscription';
import { SubscriptionsSection } from './SubscriptionsSection';

function renderSection(
  props: React.ComponentProps<typeof SubscriptionsSection>
) {
  return render(
    <MemoryRouter>
      <SubscriptionsSection {...props} />
    </MemoryRouter>
  );
}

describe('SubscriptionsSection', () => {
  it('shows a skeleton when loading', () => {
    const { container } = renderSection({
      currentIncome: 0,
      loading: true,
      subscriptions: [],
    });

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0
    );
    expect(
      screen.queryByText('No subscriptions tracked yet')
    ).not.toBeInTheDocument();
  });

  it('shows the CTA card when not loading and there are no subscriptions', () => {
    renderSection({ currentIncome: 0, loading: false, subscriptions: [] });

    expect(
      screen.getByText('No subscriptions tracked yet')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Add a subscription' })
    ).toHaveAttribute('href', '/subscriptions');
  });

  it('shows summary and renewals when subscriptions are present', () => {
    renderSection({
      currentIncome: 500,
      loading: false,
      subscriptions: [makeSubscription({ name: 'Netflix' })],
    });

    expect(screen.getByText('Active Subscriptions')).toBeInTheDocument();
    expect(screen.getByText('Upcoming Renewals')).toBeInTheDocument();
  });
});
