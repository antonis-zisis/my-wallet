import { describe, expect, it } from 'vitest';

import { getSubscriptionLogoUrl } from './getSubscriptionLogoUrl';

const TOKEN = 'pk_test';

describe('getSubscriptionLogoUrl', () => {
  it('builds a logo url from the host of a safe url with the theme', () => {
    expect(
      getSubscriptionLogoUrl('https://www.netflix.com/browse', TOKEN, 'light')
    ).toBe(
      'https://img.logo.dev/netflix.com?token=pk_test&size=128&format=png&theme=light'
    );
  });

  it('requests the dark logo variant in dark mode', () => {
    expect(
      getSubscriptionLogoUrl('https://www.netflix.com', TOKEN, 'dark')
    ).toBe(
      'https://img.logo.dev/netflix.com?token=pk_test&size=128&format=png&theme=dark'
    );
  });

  it('returns null when there is no url', () => {
    expect(getSubscriptionLogoUrl(null, TOKEN, 'light')).toBeNull();
  });

  it('returns null for an unsafe url', () => {
    expect(
      getSubscriptionLogoUrl('javascript:alert(1)', TOKEN, 'light')
    ).toBeNull();
  });

  it('returns null when no token is configured', () => {
    expect(
      getSubscriptionLogoUrl('https://www.netflix.com', '', 'light')
    ).toBeNull();
  });
});
