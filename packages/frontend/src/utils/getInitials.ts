export function getInitials(user: {
  fullName: string | null;
  email: string;
}): string {
  if (user.fullName) {
    const parts = user.fullName.trim().split(/\s+/);
    const first = parts[0].charAt(0);
    const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    return (first + last).toUpperCase();
  }
  return user.email.slice(0, 2).toUpperCase();
}
