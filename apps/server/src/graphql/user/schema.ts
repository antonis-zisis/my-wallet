export const userTypeDefs = `#graphql
  type User {
    id: ID!
    supabaseId: String!
    email: String!
    fullName: String
    currency: String!
    plan: Plan
    entitlements: PlanEntitlements!
    onboardingCompletedAt: String
    onboardingProgress: OnboardingProgress!
    createdAt: String!
    updatedAt: String!
  }

  enum Plan {
    FREE
    PRO
  }

  type PlanEntitlements {
    canExportCsv: Boolean!
    canShareReports: Boolean!
    maxContracts: Int
    maxNetWorthSnapshots: Int
    maxReports: Int
    maxSubscriptions: Int
    maxTrendMonths: Int!
  }

  type PlanUsage {
    activeSubscriptions: Int!
    contracts: Int!
    netWorthSnapshots: Int!
    reports: Int!
  }

  type PlanOption {
    entitlements: PlanEntitlements!
    plan: Plan!
  }

  type OnboardingProgress {
    hasFullName: Boolean!
    hasTransaction: Boolean!
    hasSubscription: Boolean!
    hasContract: Boolean!
    hasNetWorthSnapshot: Boolean!
  }

  input SelectPlanInput {
    plan: Plan!
  }

  input UpdateUserInput {
    fullName: String
    currency: String
  }

  extend type Query {
    me: User!
    plans: [PlanOption!]!
    planUsage: PlanUsage!
  }

  extend type Mutation {
    updateMe(input: UpdateUserInput!): User!
    selectPlan(input: SelectPlanInput!): User!
    completeOnboarding: User!
    resetOnboarding: User!
  }
`;
