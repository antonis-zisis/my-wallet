import { createBrowserRouter } from 'react-router-dom';

import { App } from './App';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { NetWorth } from './pages/NetWorth';
import { NetWorthSnapshotPage } from './pages/NetWorthSnapshotPage';
import { Profile } from './pages/Profile';
import { Report } from './pages/Report';
import { Reports } from './pages/Reports';
import { Subscriptions } from './pages/Subscriptions';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <App />,
        children: [
          { index: true, element: <Home /> },
          { path: 'reports', element: <Reports /> },
          { path: 'reports/:id', element: <Report /> },
          { path: 'subscriptions', element: <Subscriptions /> },
          { path: 'net-worth', element: <NetWorth /> },
          { path: 'net-worth/:id', element: <NetWorthSnapshotPage /> },
          { path: 'profile', element: <Profile /> },
        ],
      },
    ],
  },
]);
