import { Outlet } from 'react-router';

import { ErrorBoundary } from './components/ErrorBoundary';
import { NavBar } from './components/NavBar';
import { PastDueBanner } from './components/plan/PastDueBanner';
import { ScrollToTopButton } from './components/ui/ScrollToTopButton';
import { ToastContainer } from './components/ui/Toast';

export function App() {
  return (
    <div className="bg-bg-app min-h-screen">
      <NavBar />

      <PastDueBanner />

      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>

      <ToastContainer />
      <ScrollToTopButton />
    </div>
  );
}
