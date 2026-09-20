import { Navigate, Outlet } from 'react-router';

import { useUser } from '../contexts/UserContext';
import { Spinner } from './ui';

export function RequirePlan() {
  const { loading, user } = useUser();

  if (loading) {
    return (
      <div className="bg-bg-app flex min-h-screen items-center justify-center">
        <Spinner className="text-text-tertiary h-8 w-8" />
      </div>
    );
  }

  if (user && !user.plan) {
    return <Navigate to="/select-plan" replace />;
  }

  return <Outlet />;
}
