import { Link } from 'react-router';

import { AdminUser, SUPERADMIN_ROLE } from '../../types/admin';
import { formatDate } from '../../utils/formatDate';
import { formatRelativeTime } from '../../utils/formatRelativeTime';
import { getAvatarData } from '../../utils/getAvatarData';
import { TrashIcon } from '../icons';
import { Avatar, Badge } from '../ui';

type AdminUserListRowProps = {
  user: AdminUser;
  onDelete: (user: AdminUser) => void;
};

export function AdminUserListRow({ onDelete, user }: AdminUserListRowProps) {
  const isSuperadmin = user.role === SUPERADMIN_ROLE;

  return (
    <li className="flex items-center gap-3 px-1 py-3">
      <Avatar {...getAvatarData(user)} size="md" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link
            className="text-text-primary truncate text-sm font-medium hover:underline"
            to={`/admin/users/${user.supabaseId}`}
          >
            {user.fullName ?? user.email}
          </Link>

          {isSuperadmin && (
            <Badge variant="warning" size="sm">
              Superadmin
            </Badge>
          )}
        </div>

        <p className="text-text-secondary truncate text-xs">
          {user.fullName ? `${user.email} · ` : ''}
          Joined {formatDate(user.createdAt)}
        </p>
      </div>

      <div className="hidden text-right sm:block">
        <p className="text-text-secondary text-xs">
          {user.lastSeenAt
            ? `Seen ${formatRelativeTime(user.lastSeenAt)}`
            : 'Never signed in'}
        </p>
        <p className="text-text-tertiary text-xs">
          {user.counts.reports} reports · {user.counts.transactions}{' '}
          transactions
        </p>
      </div>

      <button
        aria-label={`Delete ${user.email}`}
        className="text-text-tertiary shrink-0 cursor-pointer rounded p-1.5 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
        disabled={isSuperadmin}
        title={
          isSuperadmin ? 'Superadmin accounts cannot be deleted' : undefined
        }
        onClick={() => onDelete(user)}
      >
        <TrashIcon className="size-4" />
      </button>
    </li>
  );
}
