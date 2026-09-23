import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';

import { useToast } from '../../contexts/ToastContext';
import { ADMIN_DELETE_USER, GET_ADMIN_USER } from '../../graphql/admin';
import { AdminUserData } from '../../types/admin';

type UseAdminUserDataInput = {
  supabaseId: string;
  onDeleted: () => void;
};

export function useAdminUserData({
  onDeleted,
  supabaseId,
}: UseAdminUserDataInput) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { showError, showSuccess } = useToast();

  const { data, error, loading } = useQuery<AdminUserData>(GET_ADMIN_USER, {
    variables: { supabaseId },
  });

  const [deleteUser, { loading: isDeleting }] = useMutation(ADMIN_DELETE_USER);

  const user = data?.adminUser ?? null;

  const handleDeleteConfirm = async (confirmEmail: string) => {
    if (!user) {
      return;
    }

    try {
      await deleteUser({
        variables: { input: { confirmEmail, supabaseId } },
      });

      setIsDeleteOpen(false);
      showSuccess(`${user.email} deleted.`);
      onDeleted();
    } catch {
      showError('Failed to delete user.');
    }
  };

  return {
    error: !!error,
    isDeleteOpen,
    isDeleting,
    loading,
    onCloseDelete: () => setIsDeleteOpen(false),
    onDeleteConfirm: handleDeleteConfirm,
    onOpenDelete: () => setIsDeleteOpen(true),
    user,
  };
}
