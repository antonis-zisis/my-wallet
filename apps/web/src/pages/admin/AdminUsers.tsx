import { AdminUserList } from '../../components/admin/AdminUserList';
import { DeleteUserModal } from '../../components/admin/DeleteUserModal';
import {
  PageLayout,
  Pagination,
  SearchInput,
  Select,
} from '../../components/ui';
import {
  PAGE_SIZE,
  useAdminUsersData,
} from '../../hooks/admin/useAdminUsersData';
import { ADMIN_USER_SORT_OPTIONS, AdminUserSortField } from '../../types/admin';

export function AdminUsers() {
  const {
    error,
    isDeleting,
    items,
    loading,
    onDeleteConfirm,
    onPaginate,
    onSearchChange,
    onSelectForDelete,
    onSortChange,
    page,
    search,
    sortBy,
    totalCount,
    totalPages,
    userToDelete,
  } = useAdminUsersData();

  return (
    <>
      <PageLayout>
        <div className="mb-6">
          <h1 className="text-text-primary text-2xl font-semibold">Users</h1>
          <p className="text-text-secondary mt-1 text-sm">
            {totalCount} registered {totalCount === 1 ? 'account' : 'accounts'}.
            Account metadata only — no financial data is shown here.
          </p>
        </div>

        {(loading || (!error && (totalCount > 0 || !!search))) && (
          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <SearchInput
              className="w-full sm:max-w-xs sm:flex-1"
              placeholder="Search by email or name…"
              value={search}
              onChange={onSearchChange}
            />

            <Select
              className="w-full py-1 text-sm sm:w-44"
              options={ADMIN_USER_SORT_OPTIONS}
              value={sortBy}
              onChange={(event) =>
                onSortChange(event.target.value as AdminUserSortField)
              }
            />
          </div>
        )}

        <AdminUserList
          error={error}
          isSearching={!!search}
          loading={loading}
          users={items}
          onDelete={onSelectForDelete}
        />

        {!loading && !error && totalCount > 0 && (
          <Pagination
            itemCount={items.length}
            page={page}
            pageSize={PAGE_SIZE}
            totalCount={totalCount}
            totalPages={totalPages}
            onPageChange={onPaginate}
          />
        )}
      </PageLayout>

      <DeleteUserModal
        isDeleting={isDeleting}
        isOpen={!!userToDelete}
        user={userToDelete}
        onClose={() => onSelectForDelete(null)}
        onConfirm={onDeleteConfirm}
      />
    </>
  );
}
