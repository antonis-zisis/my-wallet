import { type SyntheticEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { CircleAlertIcon, WalletIcon } from '../components/icons';
import { ThemeToggle } from '../components/ThemeToggle';
import { Button, Card, Input } from '../components/ui';
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

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();

    setError('');
    setSubmitting(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError.message);
      setSubmitting(false);
    }
  };

  const isFormEmpty = !email.trim() || !password;

  return (
    <div className="bg-bg-app flex min-h-screen items-center justify-center">
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md p-8">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="bg-brand-100 dark:bg-brand-800 flex h-12 w-12 items-center justify-center rounded-full">
            <WalletIcon className="text-brand-600 dark:text-brand-400 h-6 w-6" />
          </div>

          <h1 className="text-text-primary text-2xl font-bold">My Wallet</h1>

          <p className="text-text-secondary text-sm">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            type="email"
            label="Email"
            value={email}
            autoComplete="email"
            placeholder="you@example.com"
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <Input
            id="password"
            type="password"
            label="Password"
            value={password}
            autoComplete="current-password"
            placeholder="••••••••"
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="mt-2 w-full"
            disabled={isFormEmpty}
            isLoading={submitting}
          >
            Sign in
          </Button>

          {error && (
            <div className="flex items-center gap-2 rounded bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
              <CircleAlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}
