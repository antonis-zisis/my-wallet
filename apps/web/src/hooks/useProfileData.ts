import { type SubmitEvent, useEffect, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';

const MIN_PASSWORD_LENGTH = 6;

interface StatusMessage {
  type: 'success' | 'error';
  message: string;
}

export function useProfileData() {
  const { updateUser, user } = useUser();
  const { updatePassword } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  useEffect(() => {
    if (user?.fullName != null) {
      setFullName(user.fullName);
    }
  }, [user?.fullName]);

  const [profileStatus, setProfileStatus] = useState<StatusMessage | null>(
    null
  );
  const [profileSaving, setProfileSaving] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<StatusMessage | null>(
    null
  );
  const [passwordSaving, setPasswordSaving] = useState(false);

  const isNameUnchanged = fullName.trim() === (user?.fullName ?? '');

  const handleProfileSubmit = async (event: SubmitEvent) => {
    event.preventDefault();

    setProfileStatus(null);
    setProfileSaving(true);

    try {
      await updateUser({ fullName: fullName.trim() });
      setProfileStatus({ type: 'success', message: 'Profile updated.' });
    } catch {
      setProfileStatus({
        type: 'error',
        message: 'Failed to update profile.',
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (event: SubmitEvent) => {
    event.preventDefault();

    setPasswordStatus(null);

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setPasswordStatus({
        type: 'error',
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      });

      return;
    }

    setPasswordSaving(true);

    try {
      const { error } = await updatePassword(newPassword);

      if (error) {
        setPasswordStatus({ type: 'error', message: error.message });
      } else {
        setPasswordStatus({ type: 'success', message: 'Password changed.' });
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setPasswordStatus({
        type: 'error',
        message: 'Failed to change password.',
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  return {
    confirmPassword,
    email: user?.email ?? '',
    fullName,
    isNameUnchanged,
    newPassword,
    onConfirmPasswordChange: (event: React.ChangeEvent<HTMLInputElement>) =>
      setConfirmPassword(event.target.value),
    onFullNameChange: (event: React.ChangeEvent<HTMLInputElement>) =>
      setFullName(event.target.value),
    onNewPasswordChange: (event: React.ChangeEvent<HTMLInputElement>) =>
      setNewPassword(event.target.value),
    onPasswordSubmit: handlePasswordSubmit,
    onProfileSubmit: handleProfileSubmit,
    passwordSaving,
    passwordStatus,
    profileSaving,
    profileStatus,
  };
}
