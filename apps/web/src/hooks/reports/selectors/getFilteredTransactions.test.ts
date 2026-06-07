import { describe, expect, it } from 'vitest';

import { makeTransaction } from '../../../test/fixtures/report';
import { getFilteredTransactions } from './getFilteredTransactions';

describe('getFilteredTransactions', () => {
  const transactions = [
    makeTransaction({ id: '1', type: 'INCOME', category: 'Salary' }),
    makeTransaction({ id: '2', type: 'EXPENSE', category: 'Groceries' }),
    makeTransaction({ id: '3', type: 'EXPENSE', category: 'Rent' }),
  ];

  it('returns all transactions when type=All and category=All', () => {
    const result = getFilteredTransactions(transactions, 'All', 'All');

    expect(result).toHaveLength(3);
  });

  it('filters by type when category=All', () => {
    const result = getFilteredTransactions(transactions, 'Expense', 'All');

    expect(result.map((transaction) => transaction.id)).toEqual(['2', '3']);
  });

  it('filters by category when type=All', () => {
    const result = getFilteredTransactions(transactions, 'All', 'Groceries');

    expect(result.map((transaction) => transaction.id)).toEqual(['2']);
  });

  it('filters by both type and category', () => {
    const result = getFilteredTransactions(transactions, 'Income', 'Salary');

    expect(result.map((transaction) => transaction.id)).toEqual(['1']);
  });
});
