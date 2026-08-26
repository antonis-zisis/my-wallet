const MAX_MONTHS = 24;

export function clampMonths(months: number): number {
  return Math.min(Math.max(months, 1), MAX_MONTHS);
}
