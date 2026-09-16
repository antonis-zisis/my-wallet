import { type ChangeEvent, type SubmitEvent, useState } from 'react';

import { useAuth } from '../../contexts/AuthContext';
import { validateNewPassword } from '../../utils/validateNewPassword';

export function useSignUpForm() {
  const { signUp } = useAuth();

  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isAwaitingConfirmation, setIsAwaitingConfirmation] = useState(false);
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();

    const validationError = validateNewPassword({
      confirmPassword,
      newPassword: password,
    });

    if (validationError) {
      setError(validationError);

      return;
    }

    setError('');
    setSubmitting(true);

    const { error: signUpError, needsEmailConfirmation } = await signUp(
      email.trim(),
      password
    );

    if (signUpError) {
      setError(signUpError.message);
      setSubmitting(false);

      return;
    }

    if (!needsEmailConfirmation) {
      // the session lands on its own and the page redirects: stay loading
      return;
    }

    setIsAwaitingConfirmation(true);
    setSubmitting(false);
  };

  return {
    confirmPassword,
    email,
    error,
    isAwaitingConfirmation,
    isFormEmpty: !email.trim() || !password || !confirmPassword,
    onConfirmPasswordChange: (event: ChangeEvent<HTMLInputElement>) =>
      setConfirmPassword(event.target.value),
    onEmailChange: (event: ChangeEvent<HTMLInputElement>) =>
      setEmail(event.target.value),
    onPasswordChange: (event: ChangeEvent<HTMLInputElement>) =>
      setPassword(event.target.value),
    onSubmit: handleSubmit,
    password,
    submitting,
  };
}
