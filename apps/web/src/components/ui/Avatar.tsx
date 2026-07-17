export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';

export type AvatarDisplayData = {
  initials: string;
  label: string;
};

type AvatarProps = AvatarDisplayData & {
  className?: string;
  size?: AvatarSize;
};

export const sizeStyles: Record<AvatarSize, string> = {
  xs: 'h-5 w-5 text-[10px]',
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-xs',
  lg: 'h-16 w-16 text-xl',
};

export function Avatar({
  className = '',
  initials,
  label,
  size = 'sm',
}: AvatarProps) {
  return (
    <span
      aria-label={label}
      className={`bg-brand-500 flex items-center justify-center rounded-full font-medium tracking-wider text-white ${sizeStyles[size]} ${className}`}
    >
      {initials}
    </span>
  );
}
