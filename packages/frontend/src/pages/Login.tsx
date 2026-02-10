import { SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import ThemeToggle from '../components/ThemeToggle';
import { Button, Input } from '../components/ui';

export function Login() {
  const navigate = useNavigate();

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
          My Wallet
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="email" type="email" label="Email" />
          <Input id="password" type="password" label="Password" />

          <Button type="submit" variant="primary" className="w-full">
            Log in
          </Button>
        </form>
      </div>
    </div>
  );
}
