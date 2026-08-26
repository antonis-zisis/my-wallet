import { type ChangeEvent, type SubmitEvent, useState } from 'react';

import { useAuth } from '../../contexts/AuthContext';

export function useForgotPasswordForm() {
  const { sendPasswordResetEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();

    setSubmitting(true);

    // the result is deliberately ignored: reporting it would tell an attacker
    // whether the address has an account
    await sendPasswordResetEmail(email.trim());

    setSubmitting(false);
    setIsSent(true);
  };

  return {
    email,
    isEmailEmpty: !email.trim(),
    isSent,
    onEmailChange: (event: ChangeEvent<HTMLInputElement>) =>
      setEmail(event.target.value),
    onSubmit: handleSubmit,
    submitting,
  };
}
