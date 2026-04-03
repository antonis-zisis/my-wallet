export function formatDate(date: Date | string | number) {
  const value =
    typeof date === 'string' && /^\d+$/.test(date) ? Number(date) : date;
  const parsed = value instanceof Date ? value : new Date(value);
  const day = String(parsed.getDate()).padStart(2, '0');
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const year = parsed.getFullYear();

  return `${day}/${month}/${year}`;
}
