export type AdminUserCounts = {
  contracts: number;
  netWorthSnapshots: number;
  reports: number;
  sharedOwnedReports: number;
  sharedReports: number;
  subscriptions: number;
  transactions: number;
};

export type AdminUser = {
  counts: AdminUserCounts;
  createdAt: string;
  currency: string;
  email: string;
  fullName: string | null;
  lastSeenAt: string | null;
  onboardingCompletedAt: string | null;
  role: string;
  supabaseId: string;
};

export type AdminUsersData = {
  adminUsers: {
    items: Array<AdminUser>;
    totalCount: number;
  };
};

export type AdminUserData = {
  adminUser: AdminUser;
};

export type AdminUserSortField = 'CREATED_AT' | 'EMAIL' | 'LAST_SEEN_AT';

export const ADMIN_USER_SORT_OPTIONS: Array<{
  label: string;
  value: AdminUserSortField;
}> = [
  { label: 'Newest first', value: 'CREATED_AT' },
  { label: 'Last seen', value: 'LAST_SEEN_AT' },
  { label: 'Email', value: 'EMAIL' },
];

export const SUPERADMIN_ROLE = 'SUPERADMIN';

export type AdminOnboardingFunnel = {
  completed: number;
  total: number;
  withContract: number;
  withFullName: number;
  withNetWorthSnapshot: number;
  withSubscription: number;
  withTransaction: number;
};

export type AdminSignupBucket = {
  count: number;
  week: string;
};

export type AdminInsights = {
  activeUsers24h: number;
  activeUsers30d: number;
  activeUsers7d: number;
  onboardingFunnel: AdminOnboardingFunnel;
  registeredUsers: number;
  signupsByWeek: Array<AdminSignupBucket>;
};

export type AdminInsightsData = {
  adminInsights: AdminInsights;
};
