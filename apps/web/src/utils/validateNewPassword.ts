export const MIN_PASSWORD_LENGTH = 6;

type ValidateNewPasswordInput = {
  confirmPassword: string;
  newPassword: string;
};

export function validateNewPassword({
  confirmPassword,
  newPassword,
}: ValidateNewPasswordInput): string | null {
  if (newPassword !== confirmPassword) {
    return 'Passwords do not match.';
  }

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  return null;
}
