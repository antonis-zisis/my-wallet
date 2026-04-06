import { Outlet } from 'react-router-dom';

import { ErrorBoundary } from './components/ErrorBoundary';
import { NavBar } from './components/NavBar';
import { ToastContainer } from './components/ui/Toast';

export function App() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <NavBar />

      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>

      <ToastContainer />
    </div>
  );
}
