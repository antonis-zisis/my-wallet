import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { Spinner } from './ui';

export function ProtectedRoute() {
  const { loading, session } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Spinner className="text-text-tertiary h-8 w-8" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
