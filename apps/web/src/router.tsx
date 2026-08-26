import { createBrowserRouter } from 'react-router';

import { App } from './App';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Contracts } from './pages/Contracts';
import { ForgotPassword } from './pages/ForgotPassword';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { NetWorth } from './pages/NetWorth';
import { NetWorthSnapshotPage } from './pages/NetWorthSnapshotPage';
import { NotFound } from './pages/NotFound';
import { Profile } from './pages/Profile';
import { Report } from './pages/Report';
import { Reports } from './pages/Reports';
import { ResetPassword } from './pages/ResetPassword';
import { Subscriptions } from './pages/Subscriptions';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
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
          { path: 'contracts', element: <Contracts /> },
          { path: 'net-worth', element: <NetWorth /> },
          { path: 'net-worth/:id', element: <NetWorthSnapshotPage /> },
          { path: 'profile', element: <Profile /> },
          { path: '*', element: <NotFound /> },
        ],
      },
    ],
  },
]);
