export function getDaysUntil(date: Date | string | number): number {
  const value =
    typeof date === 'string' && /^\d+$/.test(date) ? Number(date) : date;
  const target = value instanceof Date ? new Date(value) : new Date(value);
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  return Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
}
