// Cross-platform canonical palette — keep in sync with android/ios.

export const EXPENSE_CATEGORY_COLORS: Record<string, string> = {
  'Dining Out': '#fb923c',
  Entertainment: '#a855f7',
  Groceries: '#f97316',
  Health: '#14b8a6',
  Insurance: '#60a5fa',
  Investment: '#10b981',
  Loan: '#1e3a8a',
  Other: '#9ca3af',
  Rent: '#1d4ed8',
  Shopping: '#ec4899',
  Transport: '#0891b2',
  Utilities: '#3b82f6',
};

export const BUDGET_BUCKET_COLORS: Record<string, string> = {
  Invest: '#10b981',
  Needs: '#3b82f6',
  Wants: '#f59e0b',
};

export const ASSET_CATEGORY_COLORS: Record<string, string> = {
  Brokerage: '#06b6d4',
  Crypto: '#f59e0b',
  Investments: '#10b981',
  Other: '#9ca3af',
  'Real Estate': '#ef4444',
  Retirement: '#8b5cf6',
  Savings: '#3b82f6',
  Vehicle: '#6366f1',
};

export const LIABILITY_CATEGORY_COLORS: Record<string, string> = {
  'Car Loan': '#f97316',
  'Credit Card': '#ec4899',
  Mortgage: '#dc2626',
  Other: '#9ca3af',
  'Personal Loan': '#8b5cf6',
  'Student Loan': '#f59e0b',
};

export const FALLBACK_CATEGORY_COLOR = '#9ca3af';
