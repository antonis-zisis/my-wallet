import { Report, Transaction } from '../../generated/prisma/client';

export function makeReport(overrides: Partial<Report> = {}): Report {
  return {
    id: 'report-1',
    title: 'January Budget',
    isLocked: false,
    userId: 'user-1',
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
    ...overrides,
  };
}

export function makeTransaction(
  overrides: Partial<Transaction> = {}
): Transaction {
  return {
    id: 'transaction-1',
    reportId: 'report-1',
    type: 'EXPENSE',
    amount: 50,
    description: 'Groceries',
    category: 'Food',
    date: new Date('2024-01-15'),
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
    ...overrides,
  };
}
