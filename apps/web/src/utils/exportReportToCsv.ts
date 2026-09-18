import { type Currency, DEFAULT_CURRENCY } from '../types/currency';
import { Transaction } from '../types/transaction';

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

export function buildCsvContent(
  transactions: Array<Transaction>,
  currency: Currency = DEFAULT_CURRENCY
): string {
  const headers = [
    'Date',
    'Type',
    'Category',
    'Description',
    `Amount (${currency})`,
  ];
  const rows = transactions.map((transaction) => [
    transaction.date.slice(0, 10),
    transaction.type === 'INCOME' ? 'Income' : 'Expense',
    escapeCsvField(transaction.category),
    escapeCsvField(transaction.description),
    transaction.amount.toFixed(2),
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

export function exportReportToCsv(
  title: string,
  transactions: Array<Transaction>,
  currency: Currency = DEFAULT_CURRENCY
): void {
  const content = buildCsvContent(transactions, currency);
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
