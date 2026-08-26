import { type SyntheticEvent, useState } from 'react';
import { Link, Navigate } from 'react-router';

import { AuthCardLayout } from '../components/auth/AuthCardLayout';
import { AuthFormError } from '../components/auth/AuthFormError';
import { Button, Input } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const { isRecoveringPassword, session, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isRecoveringPassword) {
    return <Navigate to="/reset-password" replace />;
  }

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
    <AuthCardLayout subtitle="Sign in to your account">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="email"
          type="email"
          label="Email"
          value={email}
          autoComplete="email"
          placeholder="you@example.com"
          onChange={(event) => setEmail(event.target.value)}
        />

        <Input
          id="password"
          type="password"
          label="Password"
          value={password}
          autoComplete="current-password"
          placeholder="••••••••"
          onChange={(event) => setPassword(event.target.value)}
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

        <div className="text-center">
          <Link
            to="/forgot-password"
            className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 text-sm"
          >
            Forgot your password?
          </Link>
        </div>

        {error && <AuthFormError message={error} />}
      </form>
    </AuthCardLayout>
  );
}
