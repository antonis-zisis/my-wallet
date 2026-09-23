import { useState } from 'react';

import { AdminUser } from '../../types/admin';

export function useAdminUsersModals() {
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

  return {
    userToDelete,
    onSelectForDelete: setUserToDelete,
  };
}
