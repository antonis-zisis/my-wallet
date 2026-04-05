import { formatDate } from './formatDate';

export function formatRelativeTime(date: Date | string | number): string {
  const now = new Date();
  const target = new Date(date);

  if (isNaN(target.getTime())) {
    return formatDate(date);
  }

  const diffMs = now.getTime() - target.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return 'just now';
  }

  if (diffMinutes < 60) {
    return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
  }

  if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  }

  if (diffDays === 1) {
    return 'yesterday';
  }

  if (diffDays < 30) {
    return `${diffDays} days ago`;
  }

  return formatDate(date);
}
