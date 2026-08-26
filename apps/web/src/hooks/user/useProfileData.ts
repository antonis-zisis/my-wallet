import { type SubmitEvent, useEffect, useState } from 'react';

import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useUser } from '../../contexts/UserContext';
import { validateNewPassword } from '../../utils/validateNewPassword';

export function useProfileData() {
  const { updateUser, user } = useUser();
  const { updatePassword } = useAuth();
  const { showError, showSuccess } = useToast();

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  useEffect(() => {
    if (user?.fullName != null) {
      setFullName(user.fullName);
    }
  }, [user?.fullName]);

  const [profileSaving, setProfileSaving] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  const isNameUnchanged = fullName.trim() === (user?.fullName ?? '');

  const handleProfileSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    setProfileSaving(true);

    try {
      await updateUser({ fullName: fullName.trim() });
      showSuccess('Profile updated.');
    } catch {
      showError('Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (event: SubmitEvent) => {
    event.preventDefault();

    const validationError = validateNewPassword({
      confirmPassword,
      newPassword,
    });

    if (validationError) {
      showError(validationError);

      return;
    }

    setPasswordSaving(true);

    try {
      const { error } = await updatePassword(newPassword);

      if (error) {
        showError(error.message);
      } else {
        showSuccess('Password changed.');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      showError('Failed to change password.');
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
    profileSaving,
  };
}
