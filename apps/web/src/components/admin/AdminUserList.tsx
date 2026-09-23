import { AdminUser } from '../../types/admin';
import { UserIcon } from '../icons';
import { Card } from '../ui';
import { AdminUserListRow } from './AdminUserListRow';
import { AdminUserListSkeleton } from './AdminUserListSkeleton';

type AdminUserListProps = {
  users: Array<AdminUser>;
  loading: boolean;
  error: boolean;
  isSearching?: boolean;
  onDelete: (user: AdminUser) => void;
};

function EmptyState({ message }: { message: string }) {
  return (
    <div className="border-border flex flex-col items-center justify-center gap-3 rounded border-2 border-dashed py-10 text-center">
      <UserIcon className="text-border-strong size-10" />

      <p className="text-text-secondary text-sm font-medium">{message}</p>
    </div>
  );
}

export function AdminUserList({
  error,
  isSearching,
  loading,
  onDelete,
  users,
}: AdminUserListProps) {
  if (loading) {
    return <AdminUserListSkeleton />;
  }

  if (error) {
    return <p className="text-center text-red-500">Failed to load users.</p>;
  }

  if (users.length === 0) {
    return (
      <EmptyState
        message={isSearching ? 'No users match your search.' : 'No users yet.'}
      />
    );
  }

  return (
    <Card>
      <ul className="divide-border divide-y">
        {users.map((user) => (
          <AdminUserListRow
            key={user.supabaseId}
            user={user}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </Card>
  );
}
