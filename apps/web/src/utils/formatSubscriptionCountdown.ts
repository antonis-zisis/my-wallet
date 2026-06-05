import { formatDate } from './formatDate';
import { getDaysUntil } from './getDaysUntil';

export function formatCancellationCountdown(endDate: string): string {
  const daysLeft = getDaysUntil(endDate);

  if (daysLeft < 0) {
    return `ended ${formatDate(endDate)}`;
  }

  if (daysLeft === 0) {
    return 'ends today';
  }

  if (daysLeft === 1) {
    return 'ends tomorrow';
  }

  return `ends in ${daysLeft} days · ${formatDate(endDate)}`;
}

export function formatTrialCountdown(trialEndsAt: string): string {
  const daysLeft = getDaysUntil(trialEndsAt);

  if (daysLeft < 0) {
    return `trial ended ${formatDate(trialEndsAt)}`;
  }

  if (daysLeft === 0) {
    return 'trial ends today';
  }

  if (daysLeft === 1) {
    return 'trial ends tomorrow';
  }

  return `trial ends in ${daysLeft} days · ${formatDate(trialEndsAt)}`;
}
