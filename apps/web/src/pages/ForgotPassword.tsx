import { Link } from 'react-router';

import { AuthCardLayout } from '../components/auth/AuthCardLayout';
import { Button, Input } from '../components/ui';
import { useForgotPasswordForm } from '../hooks/auth/useForgotPasswordForm';

const BACK_LINK_CLASS =
  'text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 text-sm';

export function ForgotPassword() {
  const { email, isEmailEmpty, isSent, onEmailChange, onSubmit, submitting } =
    useForgotPasswordForm();

  if (isSent) {
    return (
      <AuthCardLayout subtitle="Check your email">
        <div className="space-y-4 text-center">
          <p className="text-text-secondary text-sm">
            If an account exists for {email.trim()}, we've sent it a link to
            reset the password. The link expires after one hour.
          </p>

          <p className="text-text-tertiary text-xs">
            Didn't get it? Check your spam folder before requesting another
            link.
          </p>

          <Link to="/login" className={BACK_LINK_CLASS}>
            Back to sign in
          </Link>
        </div>
      </AuthCardLayout>
    );
  }

  return (
    <AuthCardLayout subtitle="Reset your password">
      <form onSubmit={onSubmit} className="space-y-4">
        <p className="text-text-secondary text-sm">
          Enter the email address for your account and we'll send you a link to
          set a new password.
        </p>

        <Input
          id="email"
          type="email"
          label="Email"
          value={email}
          autoComplete="email"
          placeholder="you@example.com"
          onChange={onEmailChange}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="mt-2 w-full"
          disabled={isEmailEmpty}
          isLoading={submitting}
        >
          Send reset link
        </Button>

        <div className="text-center">
          <Link to="/login" className={BACK_LINK_CLASS}>
            Back to sign in
          </Link>
        </div>
      </form>
    </AuthCardLayout>
  );
}
