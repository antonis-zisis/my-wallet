import { Navigate, Outlet } from 'react-router';

import { useAuth } from '../contexts/AuthContext';
import { Spinner } from './ui';

export function ProtectedRoute() {
  const { isRecoveringPassword, loading, session } = useAuth();

  if (loading) {
    return (
      <div className="bg-bg-app flex min-h-screen items-center justify-center">
        <Spinner className="text-text-tertiary h-8 w-8" />
      </div>
    );
  }

  if (isRecoveringPassword) {
    return <Navigate to="/reset-password" replace />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
