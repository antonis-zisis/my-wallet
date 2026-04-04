export function getInitials(value: string): string {
  const trimmed = value.trim();
  const parts = trimmed.split(/\s+/);

  if (parts.length > 1) {
    const first = parts[0].charAt(0);
    const last = parts[parts.length - 1].charAt(0);
    return (first + last).toUpperCase();
  }

  return trimmed.charAt(0).toUpperCase();
}
