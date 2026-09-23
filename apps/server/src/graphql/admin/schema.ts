export const adminTypeDefs = `#graphql
  type AdminUser {
    supabaseId: String!
    email: String!
    fullName: String
    currency: String!
    role: String!
    lastSeenAt: String
    onboardingCompletedAt: String
    createdAt: String!
    counts: AdminUserCounts!
  }

  type AdminUserCounts {
    contracts: Int!
    netWorthSnapshots: Int!
    reports: Int!
    sharedOwnedReports: Int!
    sharedReports: Int!
    subscriptions: Int!
    transactions: Int!
  }

  type AdminUsersResult {
    items: [AdminUser!]!
    totalCount: Int!
  }

  enum AdminUserSortField {
    CREATED_AT
    EMAIL
    LAST_SEEN_AT
  }

  input AdminDeleteUserInput {
    supabaseId: String!
    confirmEmail: String!
  }

  type AdminInsights {
    activeUsers24h: Int!
    activeUsers30d: Int!
    activeUsers7d: Int!
    onboardingFunnel: AdminOnboardingFunnel!
    registeredUsers: Int!
    signupsByWeek: [AdminSignupBucket!]!
  }

  type AdminOnboardingFunnel {
    completed: Int!
    total: Int!
    withContract: Int!
    withFullName: Int!
    withNetWorthSnapshot: Int!
    withSubscription: Int!
    withTransaction: Int!
  }

  type AdminSignupBucket {
    count: Int!
    week: String!
  }

  extend type Query {
    adminInsights: AdminInsights!
    adminUsers(page: Int, pageSize: Int, search: String, sortBy: AdminUserSortField, sortOrder: SortOrder): AdminUsersResult!
    adminUser(supabaseId: String!): AdminUser!
  }

  extend type Mutation {
    adminDeleteUser(input: AdminDeleteUserInput!): Boolean!
  }
`;
