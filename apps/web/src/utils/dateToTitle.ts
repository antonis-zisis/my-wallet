export function dateToTitle(dateString: string): string {
  const [year, month] = dateString.split('-').map(Number);

  return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}
