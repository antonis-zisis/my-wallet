import { createBrowserRouter } from 'react-router-dom';

import { App } from './App';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { NetWorth } from './pages/NetWorth';
import { Report } from './pages/Report';
import { Reports } from './pages/Reports';

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
          { path: 'net-worth', element: <NetWorth /> },
        ],
      },
    ],
  },
]);
