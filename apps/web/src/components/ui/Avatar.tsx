import { getInitials } from '../../utils/getInitials';
import { Tooltip } from './Tooltip';

export type AvatarPerson = {
  email: string;
  fullName?: string | null;
};

export type AvatarSize = 'xs' | 'sm';

type AvatarProps = AvatarPerson & {
  size?: AvatarSize;
};

export const sizeStyles: Record<AvatarSize, string> = {
  xs: 'h-5 w-5 text-[10px]',
  sm: 'h-7 w-7 text-xs',
};

export function avatarLabel({ email, fullName }: AvatarPerson): string {
  return fullName ?? email;
}

export function Avatar({ email, fullName, size = 'sm' }: AvatarProps) {
  return (
    <Tooltip content={avatarLabel({ email, fullName })}>
      <span
        className={`bg-brand-500 dark:ring-bg-surface flex items-center justify-center rounded-full font-medium text-white ring-2 ring-white ${sizeStyles[size]}`}
      >
        {getInitials(fullName ?? email)}
      </span>
    </Tooltip>
  );
}
