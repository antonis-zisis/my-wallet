export function formatDate(date: Date | string | number): string {
  const value =
    typeof date === 'string' && /^\d+$/.test(date) ? Number(date) : date;
  const parsed = value instanceof Date ? value : new Date(value);

  if (isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}
