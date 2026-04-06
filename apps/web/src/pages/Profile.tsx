import { Button, Card, Input, PageLayout } from '../components/ui';
import { useProfileData } from '../hooks/useProfileData';

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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Profile
      </h1>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Personal info
        </h2>

        <form className="space-y-4" onSubmit={onProfileSubmit}>
          <Input
            className="bg-gray-50 dark:bg-gray-600"
            id="email"
            label="Email"
            readOnly
            type="email"
            value={email}
          />

          <Input
            id="fullName"
            label="Full name"
            placeholder="Enter your full name"
            value={fullName}
            onChange={onFullNameChange}
          />

          <Button
            disabled={isNameUnchanged}
            isLoading={profileSaving}
            type="submit"
          >
            Save
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Change password
        </h2>

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

          <Button isLoading={passwordSaving} type="submit">
            Change password
          </Button>
        </form>
      </Card>
    </PageLayout>
  );
}
