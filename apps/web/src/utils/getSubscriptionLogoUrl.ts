import { isSafeUrl } from './isSafeUrl';

export function getSubscriptionLogoUrl(
  url: string | null,
  token: string,
  theme: 'light' | 'dark'
): string | null {
  if (!token || !url || !isSafeUrl(url)) {
    return null;
  }

  const domain = new URL(url).hostname.replace(/^www\./, '');

  if (!domain) {
    return null;
  }

  const params = new URLSearchParams({
    token,
    size: '128',
    format: 'png',
    theme,
  });

  return `https://img.logo.dev/${domain}?${params.toString()}`;
}
