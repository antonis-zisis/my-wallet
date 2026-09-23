import { useMutation } from '@apollo/client/react';

import { useToast } from '../../contexts/ToastContext';
import { ADMIN_DELETE_USER, GET_ADMIN_USERS } from '../../graphql/admin';
import { AdminUserSortField } from '../../types/admin';
import { useAdminUsersModals } from './useAdminUsersModals';

type AdminUsersQueryVariables = {
  page: number;
  pageSize: number;
  search?: string;
  sortBy: AdminUserSortField;
  sortOrder: 'ASC' | 'DESC';
};

type AdminUsersModals = ReturnType<typeof useAdminUsersModals>;

type UseAdminUsersMutationsInput = {
  modals: AdminUsersModals;
  variables: AdminUsersQueryVariables;
};

export function useAdminUsersMutations({
  modals,
  variables,
}: UseAdminUsersMutationsInput) {
  const { showError, showSuccess } = useToast();

  const [deleteUser, { loading: isDeleting }] = useMutation(ADMIN_DELETE_USER, {
    refetchQueries: [{ query: GET_ADMIN_USERS, variables }],
  });

  const handleDeleteConfirm = async (confirmEmail: string) => {
    const target = modals.userToDelete;

    if (!target) {
      return;
    }

    try {
      await deleteUser({
        variables: { input: { confirmEmail, supabaseId: target.supabaseId } },
      });

      modals.onSelectForDelete(null);
      showSuccess(`${target.email} deleted.`);
    } catch {
      showError('Failed to delete user.');
    }
  };

  return {
    isDeleting,
    onDeleteConfirm: handleDeleteConfirm,
  };
}
