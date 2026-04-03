import { useNavigate } from 'react-router-dom';

import { Button } from '../components/ui';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 text-center">
      <p className="text-8xl font-bold text-gray-200 dark:text-gray-700">404</p>
      <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
        Page not found
      </h1>
      <p className="mt-2 text-gray-500 dark:text-gray-400">
        The page you're looking for doesn't exist.
      </p>
      <div className="mt-8">
        <Button onClick={() => navigate('/')}>Go home</Button>
      </div>
    </div>
  );
}
