import { type FormEvent, useEffect, useState } from 'react';

import { Button, Card, Input } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';

const MIN_PASSWORD_LENGTH = 6;

export function Profile() {
  const { user, updateUser } = useUser();
  const { updatePassword } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  useEffect(() => {
    if (user?.fullName != null) {
      setFullName(user.fullName);
    }
  }, [user?.fullName]);
  const [profileStatus, setProfileStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const handleProfileSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
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

  const handlePasswordSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
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

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Profile
      </h1>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Profile
        </h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <Input
            id="email"
            label="Email"
            type="email"
            value={user?.email ?? ''}
            readOnly
            className="bg-gray-50 dark:bg-gray-600"
          />
          <Input
            id="fullName"
            label="Full name"
            value={fullName}
            onChange={(ev) => setFullName(ev.target.value)}
            placeholder="Enter your full name"
          />
          {profileStatus && (
            <p
              className={`text-sm ${profileStatus.type === 'success' ? 'text-green-600' : 'text-red-500'}`}
            >
              {profileStatus.message}
            </p>
          )}
          <Button type="submit" isLoading={profileSaving}>
            Save
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Change password
        </h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            id="newPassword"
            label="New password"
            type="password"
            value={newPassword}
            onChange={(ev) => setNewPassword(ev.target.value)}
            placeholder="Enter new password"
          />
          <Input
            id="confirmPassword"
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(ev) => setConfirmPassword(ev.target.value)}
            placeholder="Confirm new password"
          />
          {passwordStatus && (
            <p
              className={`text-sm ${passwordStatus.type === 'success' ? 'text-green-600' : 'text-red-500'}`}
            >
              {passwordStatus.message}
            </p>
          )}
          <Button type="submit" isLoading={passwordSaving}>
            Change password
          </Button>
        </form>
      </Card>
    </div>
  );
}
