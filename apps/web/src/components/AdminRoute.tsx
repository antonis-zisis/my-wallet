import { Navigate, Outlet } from 'react-router';

import { useUser } from '../contexts/UserContext';
import { SUPERADMIN_ROLE } from '../types/admin';
import { Spinner } from './ui';

export function AdminRoute() {
  const { loading, user } = useUser();

  if (loading) {
    return (
      <div className="bg-bg-app flex min-h-screen items-center justify-center">
        <Spinner className="text-text-tertiary h-8 w-8" />
      </div>
    );
  }

  if (user?.role !== SUPERADMIN_ROLE) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
