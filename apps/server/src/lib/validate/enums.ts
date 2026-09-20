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

export const SHARE_ROLES = ['VIEWER', 'EDITOR'] as const;

export const NET_WORTH_ENTRY_TYPES = ['ASSET', 'LIABILITY'] as const;

export const CURRENCIES = ['EUR', 'USD', 'GBP'] as const;

export const PLANS = ['FREE', 'PRO'] as const;

export const BILLING_INTERVALS = ['MONTH', 'YEAR'] as const;

export const PLAN_STATUSES = [
  'ACTIVE',
  'TRIALING',
  'PAST_DUE',
  'CANCELED',
] as const;
