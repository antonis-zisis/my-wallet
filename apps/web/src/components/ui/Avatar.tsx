import { getInitials } from '../../utils/getInitials';
import { Tooltip } from './Tooltip';

type AvatarPerson = {
  email: string;
  fullName?: string | null;
};

type AvatarSize = 'xs' | 'sm';

type AvatarProps = AvatarPerson & {
  size?: AvatarSize;
};

const sizeStyles: Record<AvatarSize, string> = {
  xs: 'h-5 w-5 text-[10px]',
  sm: 'h-7 w-7 text-xs',
};

function avatarLabel({ email, fullName }: AvatarPerson): string {
  return fullName ? `${fullName} (${email})` : email;
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

const MAX_VISIBLE_AVATARS = 3;

type AvatarGroupProps = {
  people: Array<AvatarPerson>;
  size?: AvatarSize;
};

export function AvatarGroup({ people, size = 'sm' }: AvatarGroupProps) {
  if (people.length === 0) {
    return null;
  }

  const visible = people.slice(0, MAX_VISIBLE_AVATARS);
  const overflow = people.slice(MAX_VISIBLE_AVATARS);

  return (
    <span className="flex items-center -space-x-2">
      {visible.map((person) => (
        <Avatar
          key={person.email}
          email={person.email}
          fullName={person.fullName}
          size={size}
        />
      ))}

      {overflow.length > 0 && (
        <Tooltip content={overflow.map(avatarLabel).join(', ')}>
          <span
            className={`bg-bg-muted text-text-secondary dark:ring-bg-surface flex items-center justify-center rounded-full font-medium ring-2 ring-white ${sizeStyles[size]}`}
          >
            +{overflow.length}
          </span>
        </Tooltip>
      )}
    </span>
  );
}
