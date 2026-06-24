export function formatDateForInput(dateString: string): string {
  const value = /^\d+$/.test(dateString) ? Number(dateString) : dateString;
  const parsed = new Date(value);
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
