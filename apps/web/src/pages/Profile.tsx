import { LockClosedIcon, UserIcon } from '../components/icons';
import { Button, Card, Input, PageLayout } from '../components/ui';
import { useProfileData } from '../hooks/useProfileData';
import { getInitials } from '../utils/getInitials';

export function Profile() {
  const {
    confirmPassword,
    email,
    fullName,
    isNameUnchanged,
    newPassword,
    onConfirmPasswordChange,
    onFullNameChange,
    onNewPasswordChange,
    onPasswordSubmit,
    onProfileSubmit,
    passwordSaving,
    profileSaving,
  } = useProfileData();

  return (
    <PageLayout className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="bg-brand-500 ring-brand-100 dark:ring-brand-800/50 flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-semibold text-white ring-4">
          {getInitials(fullName || email)}
        </div>
        <div>
          <h1 className="text-text-primary text-xl font-semibold">
            {fullName || email}
          </h1>
          {fullName && <p className="text-text-secondary text-sm">{email}</p>}
        </div>
      </div>

      <Card className="p-6">
        <div className="border-border mb-5 flex items-center gap-3 border-b pb-4">
          <div className="bg-brand-50 dark:bg-brand-800/30 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
            <span className="text-brand-600 dark:text-brand-400 h-4 w-4">
              <UserIcon />
            </span>
          </div>
          <div>
            <h2 className="text-text-primary text-sm font-semibold">
              Personal info
            </h2>
            <p className="text-text-secondary text-xs">
              Update your name and contact details
            </p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={onProfileSubmit}>
          <div>
            <p className="text-text-secondary mb-1 text-sm font-medium">
              Email
            </p>
            <div className="border-border bg-bg-muted text-text-secondary rounded border px-3 py-2 text-sm">
              {email}
            </div>
            <p className="text-text-tertiary mt-1 text-xs">
              Email address cannot be changed.
            </p>
          </div>

          <Input
            id="fullName"
            label="Full name"
            placeholder="Enter your full name"
            value={fullName}
            onChange={onFullNameChange}
          />

          <div className="flex justify-end pt-1">
            <Button
              disabled={isNameUnchanged}
              isLoading={profileSaving}
              type="submit"
            >
              Save
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <div className="border-border mb-5 flex items-center gap-3 border-b pb-4">
          <div className="bg-bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
            <span className="text-text-secondary h-4 w-4">
              <LockClosedIcon />
            </span>
          </div>
          <div>
            <h2 className="text-text-primary text-sm font-semibold">
              Change password
            </h2>
            <p className="text-text-secondary text-xs">
              Choose a strong password for your account
            </p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={onPasswordSubmit}>
          <Input
            id="newPassword"
            label="New password"
            placeholder="Enter new password"
            type="password"
            value={newPassword}
            onChange={onNewPasswordChange}
          />

          <Input
            id="confirmPassword"
            label="Confirm password"
            placeholder="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={onConfirmPasswordChange}
          />

          <div className="flex justify-end pt-1">
            <Button
              disabled={!newPassword}
              isLoading={passwordSaving}
              type="submit"
            >
              Change password
            </Button>
          </div>
        </form>
      </Card>
    </PageLayout>
  );
}
