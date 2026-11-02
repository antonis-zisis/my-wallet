import { Contract } from '../../../types/contract';

type ContractTerm = Pick<Contract, 'startDate' | 'endDate'>;

const MONTHS_PER_YEAR = 12;
const DAYS_PER_MONTH = 30;

function parseContractDate(date: string): Date {
  return new Date(/^\d+$/.test(date) ? Number(date) : date);
}

function pluralize(count: number, unit: string): string {
  return `${count} ${unit}${count === 1 ? '' : 's'}`;
}

// Terms usually end the day before the anniversary (Jan 1 – Dec 31), so the
// duration is rounded to the nearest month rather than counted in full months.
function countRoundedMonths(start: Date, end: Date): number {
  const wholeMonths =
    (end.getUTCFullYear() - start.getUTCFullYear()) * MONTHS_PER_YEAR +
    end.getUTCMonth() -
    start.getUTCMonth();
  const remainingDays = end.getUTCDate() - start.getUTCDate();

  return wholeMonths + Math.round(remainingDays / DAYS_PER_MONTH);
}

export function getContractDurationLabel({
  endDate,
  startDate,
}: ContractTerm): string | null {
  if (!startDate || !endDate) {
    return null;
  }

  const months = countRoundedMonths(
    parseContractDate(startDate),
    parseContractDate(endDate)
  );

  if (!(months >= 1)) {
    return null;
  }

  return months % MONTHS_PER_YEAR === 0
    ? pluralize(months / MONTHS_PER_YEAR, 'Year')
    : pluralize(months, 'Month');
}
