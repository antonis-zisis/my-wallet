import { Link } from 'react-router';

import { AuthCardLayout } from '../components/auth/AuthCardLayout';
import { AuthFormError } from '../components/auth/AuthFormError';
import { Button, Input, Spinner } from '../components/ui';
import { useResetPasswordForm } from '../hooks/auth/useResetPasswordForm';

const BACK_LINK_CLASS =
  'text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 text-sm';

export function ResetPassword() {
  const {
    canSetPassword,
    confirmPassword,
    error,
    isFormEmpty,
    loading,
    newPassword,
    onConfirmPasswordChange,
    onNewPasswordChange,
    onSubmit,
    submitting,
  } = useResetPasswordForm();

  if (loading) {
    return (
      <AuthCardLayout subtitle="Set a new password">
        <div className="flex justify-center py-4">
          <Spinner className="text-text-tertiary h-8 w-8" />
        </div>
      </AuthCardLayout>
    );
  }

  if (!canSetPassword) {
    return (
      <AuthCardLayout subtitle="Link expired">
        <div className="space-y-4 text-center">
          <p className="text-text-secondary text-sm">
            This password reset link is invalid or has already been used. Reset
            links expire one hour after they're sent.
          </p>

          <Link to="/forgot-password" className={BACK_LINK_CLASS}>
            Request a new link
          </Link>
        </div>
      </AuthCardLayout>
    );
  }

  return (
    <AuthCardLayout subtitle="Set a new password">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          id="newPassword"
          type="password"
          label="New password"
          value={newPassword}
          autoComplete="new-password"
          placeholder="••••••••"
          onChange={onNewPasswordChange}
        />

        <Input
          id="confirmPassword"
          type="password"
          label="Confirm new password"
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
          Update password
        </Button>

        {error && <AuthFormError message={error} />}
      </form>
    </AuthCardLayout>
  );
}
