import {
  AdminInsights,
  AdminOnboardingFunnel,
  AdminUser,
  AdminUserCounts,
} from '../../types/admin';

export function makeAdminUserCounts(
  overrides: Partial<AdminUserCounts> = {}
): AdminUserCounts {
  return {
    contracts: 0,
    netWorthSnapshots: 0,
    reports: 0,
    sharedOwnedReports: 0,
    sharedReports: 0,
    subscriptions: 0,
    transactions: 0,
    ...overrides,
  };
}

export function makeAdminUser(overrides: Partial<AdminUser> = {}): AdminUser {
  return {
    counts: makeAdminUserCounts(),
    createdAt: '2026-01-15T10:00:00.000Z',
    currency: 'EUR',
    email: 'ada@example.com',
    fullName: 'Ada Lovelace',
    lastSeenAt: '2026-09-20T10:00:00.000Z',
    onboardingCompletedAt: null,
    role: 'USER',
    supabaseId: 'supabase-user-2',
    ...overrides,
  };
}

export function makeAdminOnboardingFunnel(
  overrides: Partial<AdminOnboardingFunnel> = {}
): AdminOnboardingFunnel {
  return {
    completed: 1,
    total: 4,
    withContract: 2,
    withFullName: 3,
    withNetWorthSnapshot: 1,
    withSubscription: 2,
    withTransaction: 3,
    ...overrides,
  };
}

export function makeAdminInsights(
  overrides: Partial<AdminInsights> = {}
): AdminInsights {
  return {
    activeUsers24h: 1,
    activeUsers30d: 4,
    activeUsers7d: 3,
    onboardingFunnel: makeAdminOnboardingFunnel(),
    registeredUsers: 4,
    signupsByWeek: [
      { count: 1, week: '2026-09-07' },
      { count: 3, week: '2026-09-14' },
    ],
    ...overrides,
  };
}
