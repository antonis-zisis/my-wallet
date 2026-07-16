import { Report, ReportMember } from '../../types/report';
import { Transaction } from '../../types/transaction';

export function makeReportMember(
  overrides: Partial<ReportMember> = {}
): ReportMember {
  return {
    id: 'user-1',
    userId: 'supabase-user-1',
    email: 'user@example.com',
    fullName: 'John Doe',
    role: 'OWNER',
    ...overrides,
  };
}

export function makeReport(overrides: Partial<Report> = {}): Report {
  return {
    id: 'report-1',
    title: 'June 2025',
    isLocked: false,
    members: [makeReportMember()],
    myRole: 'OWNER',
    netBalance: 0,
    transactionCount: 0,
    transactions: [],
    createdAt: '2025-06-01T00:00:00.000Z',
    updatedAt: '2025-06-01T00:00:00.000Z',
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
    description: 'Coffee',
    category: 'Dining Out',
    date: '2025-06-15T00:00:00.000Z',
    createdById: null,
    createdAt: '2025-06-15T00:00:00.000Z',
    updatedAt: '2025-06-15T00:00:00.000Z',
    ...overrides,
  };
}
