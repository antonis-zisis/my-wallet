import { Outlet } from 'react-router-dom';

import { ErrorBoundary } from './components/ErrorBoundary';
import { NavBar } from './components/NavBar';

export function App() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <NavBar />
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </div>
  );
}
