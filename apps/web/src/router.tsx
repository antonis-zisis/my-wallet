import { createBrowserRouter } from 'react-router';

import { App } from './App';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminRoute } from './components/AdminRoute';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminInsights } from './pages/admin/AdminInsights';
import { AdminUserDetail } from './pages/admin/AdminUserDetail';
import { AdminUsers } from './pages/admin/AdminUsers';
import { CategoryTrends } from './pages/CategoryTrends';
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
import { SignUp } from './pages/SignUp';
import { Subscriptions } from './pages/Subscriptions';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <SignUp />,
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
          { path: 'reports/trends', element: <CategoryTrends /> },
          { path: 'reports/:id', element: <Report /> },
          { path: 'subscriptions', element: <Subscriptions /> },
          { path: 'contracts', element: <Contracts /> },
          { path: 'net-worth', element: <NetWorth /> },
          { path: 'net-worth/:id', element: <NetWorthSnapshotPage /> },
          { path: 'profile', element: <Profile /> },
          { path: '*', element: <NotFound /> },
        ],
      },
      {
        path: 'admin',
        element: <AdminRoute />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminUsers /> },
              { path: 'users/:supabaseId', element: <AdminUserDetail /> },
              { path: 'insights', element: <AdminInsights /> },
            ],
          },
        ],
      },
    ],
  },
]);
