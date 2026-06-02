export function daysSince(dateString: string): number {
  const value = /^\d+$/.test(dateString) ? Number(dateString) : dateString;
  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) {
    return 0;
  }

  const diffMs = Date.now() - parsed.getTime();

  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function formatStaleness(daysAgo: number): string {
  if (daysAgo === 0) {
    return 'Last updated today';
  }

  if (daysAgo === 1) {
    return 'Last updated yesterday';
  }

  return `Last updated ${daysAgo} days ago`;
}
