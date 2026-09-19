export const userTypeDefs = `#graphql
  type User {
    id: ID!
    supabaseId: String!
    email: String!
    fullName: String
    currency: String!
    onboardingCompletedAt: String
    onboardingProgress: OnboardingProgress!
    createdAt: String!
    updatedAt: String!
  }

  type OnboardingProgress {
    hasFullName: Boolean!
    hasTransaction: Boolean!
    hasSubscription: Boolean!
    hasContract: Boolean!
    hasNetWorthSnapshot: Boolean!
  }

  input UpdateUserInput {
    fullName: String
    currency: String
  }

  extend type Query {
    me: User!
  }

  extend type Mutation {
    updateMe(input: UpdateUserInput!): User!
    completeOnboarding: User!
    resetOnboarding: User!
  }
`;
