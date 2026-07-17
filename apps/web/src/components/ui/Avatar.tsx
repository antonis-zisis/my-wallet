import { Tooltip } from './Tooltip';

export type AvatarSize = 'xs' | 'sm';

export type AvatarDisplayData = {
  initials: string;
  label: string;
};

type AvatarProps = AvatarDisplayData & {
  size?: AvatarSize;
};

export const sizeStyles: Record<AvatarSize, string> = {
  xs: 'h-5 w-5 text-[10px]',
  sm: 'h-7 w-7 text-xs',
};

export function Avatar({ initials, label, size = 'sm' }: AvatarProps) {
  return (
    <Tooltip content={label}>
      <span
        className={`bg-brand-500 dark:ring-bg-surface flex items-center justify-center rounded-full font-medium text-white ring-2 ring-white ${sizeStyles[size]}`}
      >
        {initials}
      </span>
    </Tooltip>
  );
}
