import { Outlet } from 'react-router-dom';

import { NavBar } from './components/NavBar';

export function App() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <NavBar />
      <Outlet />
    </div>
  );
}
