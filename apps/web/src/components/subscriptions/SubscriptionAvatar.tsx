import { useState } from 'react';

import { useTheme } from '../../contexts/ThemeContext';
import { env } from '../../lib/env';
import { Subscription } from '../../types/subscription';
import { getInitials } from '../../utils/getInitials';
import { getSubscriptionLogoUrl } from '../../utils/getSubscriptionLogoUrl';

type SubscriptionAvatarProps = {
  subscription: Subscription;
};

export function SubscriptionAvatar({ subscription }: SubscriptionAvatarProps) {
  const [logoFailed, setLogoFailed] = useState(false);
  const { resolvedTheme } = useTheme();
  const logoUrl = getSubscriptionLogoUrl(
    subscription.url,
    env.VITE_LOGO_DEV_TOKEN,
    resolvedTheme
  );

  if (logoUrl && !logoFailed) {
    return (
      <img
        alt=""
        className="size-8 shrink-0 rounded object-contain"
        loading="lazy"
        onError={() => setLogoFailed(true)}
        src={logoUrl}
      />
    );
  }

  return (
    <div
      aria-hidden
      className="bg-brand-500 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
    >
      {getInitials(subscription.name)}
    </div>
  );
}
