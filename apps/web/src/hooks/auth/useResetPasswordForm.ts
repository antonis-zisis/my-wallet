import { type ChangeEvent, type SubmitEvent, useState } from 'react';
import { useNavigate } from 'react-router';

import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { validateNewPassword } from '../../utils/validateNewPassword';

export function useResetPasswordForm() {
  const { loading, session, signOut, updatePassword } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();

    const validationError = validateNewPassword({
      confirmPassword,
      newPassword,
    });

    if (validationError) {
      setError(validationError);

      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const { error: updateError } = await updatePassword(newPassword);

      if (updateError) {
        setError(updateError.message);
        setSubmitting(false);

        return;
      }

      showSuccess('Password updated. Sign in with your new password.');
      await signOut();
      navigate('/login', { replace: true });
    } catch {
      setError('Failed to update password.');
      setSubmitting(false);
    }
  };

  return {
    canSetPassword: Boolean(session),
    confirmPassword,
    error,
    isFormEmpty: !newPassword || !confirmPassword,
    loading,
    newPassword,
    onConfirmPasswordChange: (event: ChangeEvent<HTMLInputElement>) =>
      setConfirmPassword(event.target.value),
    onNewPasswordChange: (event: ChangeEvent<HTMLInputElement>) =>
      setNewPassword(event.target.value),
    onSubmit: handleSubmit,
    submitting,
  };
}
