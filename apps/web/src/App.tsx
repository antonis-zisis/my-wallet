import { Outlet } from 'react-router-dom';

import { ErrorBoundary } from './components/ErrorBoundary';
import { NavBar } from './components/NavBar';
import { ToastContainer } from './components/ui/Toast';

export function App() {
  return (
    <div className="bg-bg-app min-h-screen">
      <NavBar />

      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>

      <ToastContainer />
    </div>
  );
}
