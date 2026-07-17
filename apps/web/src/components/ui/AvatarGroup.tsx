import { Avatar, AvatarDisplayData, AvatarSize, sizeStyles } from './Avatar';
import { Tooltip } from './Tooltip';

const MAX_VISIBLE_AVATARS = 3;
const RING_CLASS_NAME = 'ring-2 ring-white dark:ring-bg-surface';

type AvatarGroupProps = {
  people: Array<AvatarDisplayData>;
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
      {visible.map((person, index) => (
        <Tooltip key={`${person.label}-${index}`} content={person.label}>
          <Avatar
            className={RING_CLASS_NAME}
            initials={person.initials}
            label={person.label}
            size={size}
          />
        </Tooltip>
      ))}

      {overflow.length > 0 && (
        <Tooltip content={overflow.map((person) => person.label).join(', ')}>
          <span
            className={`bg-bg-muted text-text-secondary dark:ring-bg-surface flex items-center justify-center rounded-full font-medium tracking-wider ring-2 ring-white ${sizeStyles[size]}`}
          >
            +{overflow.length}
          </span>
        </Tooltip>
      )}
    </span>
  );
}
