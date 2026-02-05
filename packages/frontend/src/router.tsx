import { createBrowserRouter } from 'react-router-dom';
import { App } from './App';
import { Home } from './pages/Home';
import { Reports } from './pages/Reports';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'reports', element: <Reports /> },
    ],
  },
]);
