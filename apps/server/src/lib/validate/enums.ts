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

export const USER_ROLES = ['USER', 'SUPERADMIN'] as const;

export const SUPERADMIN_ROLE: (typeof USER_ROLES)[number] = 'SUPERADMIN';

export const NET_WORTH_ENTRY_TYPES = ['ASSET', 'LIABILITY'] as const;

export const CURRENCIES = ['EUR', 'USD', 'GBP'] as const;
