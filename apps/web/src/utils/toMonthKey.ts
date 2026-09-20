export function toMonthKey(year: number, monthIndex: number): string {
  const date = new Date(Date.UTC(year, monthIndex, 1));
  const month = `${date.getUTCMonth() + 1}`.padStart(2, '0');

  return `${date.getUTCFullYear()}-${month}`;
}
