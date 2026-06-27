import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { makeSubscription } from '../../test/fixtures/subscription';
import { SubscriptionAvatar } from './SubscriptionAvatar';

vi.mock('../../lib/env', () => ({
  env: { VITE_LOGO_DEV_TOKEN: 'pk_test' },
}));

vi.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({ resolvedTheme: 'light' }),
}));

describe('SubscriptionAvatar', () => {
  it('renders the logo image when the subscription has a safe url', () => {
    const subscription = makeSubscription({ url: 'https://www.netflix.com' });

    const { container } = render(
      <SubscriptionAvatar subscription={subscription} />
    );

    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      'https://img.logo.dev/netflix.com?token=pk_test&size=128&format=png&theme=light'
    );
  });

  it('renders initials when the subscription has no url', () => {
    const subscription = makeSubscription({ name: 'Disney Plus', url: null });

    const { container } = render(
      <SubscriptionAvatar subscription={subscription} />
    );

    expect(screen.getByText('DP')).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
  });

  it('falls back to initials when the logo image fails to load', () => {
    const subscription = makeSubscription({
      name: 'Disney Plus',
      url: 'https://www.disneyplus.com',
    });

    const { container } = render(
      <SubscriptionAvatar subscription={subscription} />
    );
    const image = container.querySelector('img');

    fireEvent.error(image!);

    expect(screen.getByText('DP')).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
  });
});
