import { describe, expect, it } from 'vitest';

import { Transaction } from '../types/transaction';
import { buildCsvContent } from './exportReportToCsv';

const makeTransaction = (
  overrides: Partial<Transaction> = {}
): Transaction => ({
  id: '1',
  reportId: 'report-1',
  type: 'INCOME',
  amount: 100,
  description: 'Salary',
  category: 'Salary',
  date: '2024-01-15T00:00:00.000Z',
  createdAt: '2024-01-15T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
  ...overrides,
});

describe('buildCsvContent', () => {
  it('returns a header row and one row per transaction', () => {
    const transactions = [makeTransaction(), makeTransaction({ id: '2' })];
    const lines = buildCsvContent(transactions).split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe('Date,Type,Category,Description,Amount');
  });

  it('formats an income transaction correctly', () => {
    const transactions = [
      makeTransaction({
        type: 'INCOME',
        amount: 1500,
        category: 'Salary',
        description: 'Monthly salary',
        date: '2024-03-01T00:00:00.000Z',
      }),
    ];
    const lines = buildCsvContent(transactions).split('\n');
    expect(lines[1]).toBe('2024-03-01,Income,Salary,Monthly salary,1500.00');
  });

  it('formats an expense transaction correctly', () => {
    const transactions = [
      makeTransaction({
        type: 'EXPENSE',
        amount: 42.5,
        category: 'Groceries',
        description: 'Weekly shop',
        date: '2024-03-05T00:00:00.000Z',
      }),
    ];
    const lines = buildCsvContent(transactions).split('\n');
    expect(lines[1]).toBe('2024-03-05,Expense,Groceries,Weekly shop,42.50');
  });

  it('wraps descriptions containing commas in quotes', () => {
    const transactions = [makeTransaction({ description: 'Coffee, pastry' })];
    const lines = buildCsvContent(transactions).split('\n');
    expect(lines[1]).toContain('"Coffee, pastry"');
  });

  it('escapes double quotes inside description fields', () => {
    const transactions = [makeTransaction({ description: 'He said "hello"' })];
    const lines = buildCsvContent(transactions).split('\n');
    expect(lines[1]).toContain('"He said ""hello"""');
  });

  it('returns only the header row for an empty transaction list', () => {
    const content = buildCsvContent([]);
    expect(content).toBe('Date,Type,Category,Description,Amount');
  });

  it('uses only the date portion of an ISO datetime string', () => {
    const transactions = [
      makeTransaction({ date: '2024-06-20T14:30:00.000Z' }),
    ];
    const lines = buildCsvContent(transactions).split('\n');
    expect(lines[1].startsWith('2024-06-20,')).toBe(true);
  });
});
