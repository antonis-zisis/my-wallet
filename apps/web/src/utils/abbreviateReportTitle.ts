const MONTH_ABBREVIATIONS: Record<string, string> = {
  January: 'Jan',
  February: 'Feb',
  March: 'Mar',
  April: 'Apr',
  May: 'May',
  June: 'Jun',
  July: 'Jul',
  August: 'Aug',
  September: 'Sep',
  October: 'Oct',
  November: 'Nov',
  December: 'Dec',
};

const MONTH_YEAR_PATTERN = /^([A-Za-z]+)\s+(\d{4})$/;

export function abbreviateReportTitle(title: string): string {
  const match = MONTH_YEAR_PATTERN.exec(title);

  if (!match) {
    return title.length > 14 ? title.slice(0, 14) + '…' : title;
  }

  const [, month, year] = match;
  const abbreviation = MONTH_ABBREVIATIONS[month];

  if (!abbreviation) {
    return title.length > 14 ? title.slice(0, 14) + '…' : title;
  }

  return `${abbreviation} '${year.slice(2)}`;
}
