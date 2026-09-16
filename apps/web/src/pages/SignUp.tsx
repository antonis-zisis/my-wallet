import { Navigate } from 'react-router';

import { AuthCardLayout } from '../components/auth/AuthCardLayout';
import { AuthFormError } from '../components/auth/AuthFormError';
import { AuthLink } from '../components/auth/AuthLink';
import { Button, Input } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useSignUpForm } from '../hooks/auth/useSignUpForm';
import { MIN_PASSWORD_LENGTH } from '../utils/validateNewPassword';

export function SignUp() {
  const { isRecoveringPassword, session } = useAuth();
  const {
    confirmPassword,
    email,
    error,
    isAwaitingConfirmation,
    isFormEmpty,
    onConfirmPasswordChange,
    onEmailChange,
    onPasswordChange,
    onSubmit,
    password,
    submitting,
  } = useSignUpForm();

  if (isRecoveringPassword) {
    return <Navigate to="/reset-password" replace />;
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  if (isAwaitingConfirmation) {
    return (
      <AuthCardLayout subtitle="Check your email">
        <div className="space-y-4 text-center">
          <p className="text-text-secondary text-sm">
            We've sent a confirmation link to {email.trim()}. Open it to finish
            creating your account.
          </p>

          <p className="text-text-tertiary text-xs">
            Didn't get it? Check your spam folder before signing up again.
          </p>

          <AuthLink to="/login">Back to sign in</AuthLink>
        </div>
      </AuthCardLayout>
    );
  }

  return (
    <AuthCardLayout subtitle="Create your account">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          id="email"
          type="email"
          label="Email"
          value={email}
          autoComplete="email"
          placeholder="you@example.com"
          onChange={onEmailChange}
        />

        <Input
          id="password"
          type="password"
          label="Password"
          value={password}
          autoComplete="new-password"
          placeholder="••••••••"
          onChange={onPasswordChange}
        />

        <p className="text-text-tertiary text-xs">
          Use at least {MIN_PASSWORD_LENGTH} characters.
        </p>

        <Input
          id="confirmPassword"
          type="password"
          label="Confirm password"
          value={confirmPassword}
          autoComplete="new-password"
          placeholder="••••••••"
          onChange={onConfirmPasswordChange}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="mt-2 w-full"
          disabled={isFormEmpty}
          isLoading={submitting}
        >
          Create account
        </Button>

        <div className="text-center">
          <AuthLink to="/login">Already have an account? Sign in</AuthLink>
        </div>

        {error && <AuthFormError message={error} />}
      </form>
    </AuthCardLayout>
  );
}
