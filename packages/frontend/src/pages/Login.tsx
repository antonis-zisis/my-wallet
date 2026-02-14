import { type FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';

import ThemeToggle from '../components/ThemeToggle';
import { Button, Input } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const { session, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (session) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError.message);
      setSubmitting(false);
    }
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
          <Input
            id="email"
            type="email"
            label="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <Input
            id="password"
            type="password"
            label="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? 'Logging in...' : 'Log in'}
          </Button>
        </form>
      </div>
    </div>
  );
}
