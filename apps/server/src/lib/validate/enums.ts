export const BILLING_CYCLES = [
  'WEEKLY',
  'MONTHLY',
  'QUARTERLY',
  'BI_ANNUAL',
  'YEARLY',
] as const;

export const SUBSCRIPTION_CATEGORIES = [
  'Entertainment',
  'Productivity',
  'Utilities',
  'Health',
  'Finance',
  'Education',
  'Music',
  'News',
  'Other',
] as const;

export const TRANSACTION_TYPES = ['INCOME', 'EXPENSE'] as const;

export const NET_WORTH_ENTRY_TYPES = ['ASSET', 'LIABILITY'] as const;
