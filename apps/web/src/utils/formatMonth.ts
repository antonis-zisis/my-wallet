function toMonthDate(monthKey: string): Date {
  return new Date(`${monthKey}-01T00:00:00.000Z`);
}

export function formatMonth(monthKey: string): string {
  return toMonthDate(monthKey).toLocaleString('en-US', {
    month: 'short',
    timeZone: 'UTC',
  });
}

export function formatMonthWithYear(monthKey: string): string {
  return `${formatMonth(monthKey)} '${monthKey.slice(2, 4)}`;
}
