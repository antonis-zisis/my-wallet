export type TransactionType = 'INCOME' | 'EXPENSE';

export type Transaction = {
  id: string;
  reportId: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TransactionFormInput = {
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string;
};

export type CategoryMonthlyTotal = {
  category: string;
  month: string;
  total: number;
};

export type ExpenseCategoryTotalsData = {
  expenseCategoryTotalsByMonth: Array<CategoryMonthlyTotal>;
};

export const EXPENSE_CATEGORIES = [
  'Household',
  'Utilities',
  'Groceries',
  'Dining & Takeaway',
  'Transport',
  'Travel',
  'Health',
  'Personal Care',
  'Kids',
  'Entertainment',
  'Digital & Apps',
  'Shopping',
  'Gifts',
  'Investment',
  'Loan',
  'Other',
] as const;

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investment',
  'Gift',
  'Other',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
