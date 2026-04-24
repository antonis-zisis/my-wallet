import { getAvatarColor } from '../../utils/getAvatarColor';
import { getInitials } from '../../utils/getInitials';

interface SubscriptionAvatarProps {
  name: string;
  muted?: boolean;
}

export function SubscriptionAvatar({
  muted = false,
  name,
}: SubscriptionAvatarProps) {
  const colorClass = muted
    ? 'bg-gray-300 dark:bg-gray-600'
    : getAvatarColor(name);

  return (
    <div
      aria-hidden
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${colorClass}`}
    >
      {getInitials(name)}
    </div>
  );
}
