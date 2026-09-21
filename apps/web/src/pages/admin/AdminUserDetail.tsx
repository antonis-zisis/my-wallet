import { Link, useNavigate, useParams } from 'react-router';

import { AdminUserSummary } from '../../components/admin/AdminUserSummary';
import { DeleteUserModal } from '../../components/admin/DeleteUserModal';
import { Button, Card, PageLayout, Skeleton } from '../../components/ui';
import { useAdminUserData } from '../../hooks/admin/useAdminUserData';
import { SUPERADMIN_ROLE } from '../../types/admin';

export function AdminUserDetail() {
  const { supabaseId = '' } = useParams();
  const navigate = useNavigate();

  const {
    error,
    isDeleteOpen,
    isDeleting,
    loading,
    onCloseDelete,
    onDeleteConfirm,
    onOpenDelete,
    user,
  } = useAdminUserData({
    supabaseId,
    onDeleted: () => navigate('/admin'),
  });

  return (
    <>
      <PageLayout>
        <Link
          className="text-text-secondary mb-4 inline-block text-sm hover:underline"
          to="/admin"
        >
          ← All users
        </Link>

        {loading && (
          <div className="space-y-3" data-testid="admin-user-detail-skeleton">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {!loading && error && (
          <p className="text-center text-red-500">Failed to load this user.</p>
        )}

        {!loading && !error && user && (
          <>
            <AdminUserSummary user={user} />

            {user.role !== SUPERADMIN_ROLE && (
              <Card className="mt-4 border-red-200 dark:border-red-900">
                <div className="flex flex-col gap-3 p-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-text-primary text-sm font-medium">
                      Delete this account
                    </p>
                    <p className="text-text-secondary text-sm">
                      Removes every record they own and their sign-in account.
                      This cannot be undone.
                    </p>
                  </div>

                  <Button
                    className="shrink-0"
                    variant="danger"
                    onClick={onOpenDelete}
                  >
                    Delete user
                  </Button>
                </div>
              </Card>
            )}
          </>
        )}
      </PageLayout>

      <DeleteUserModal
        isDeleting={isDeleting}
        isOpen={isDeleteOpen}
        user={user}
        onClose={onCloseDelete}
        onConfirm={onDeleteConfirm}
      />
    </>
  );
}
