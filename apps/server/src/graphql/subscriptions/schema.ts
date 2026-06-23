export const subscriptionTypeDefs = `#graphql
  type Subscription {
    id: ID!
    name: String!
    amount: Float!
    billingCycle: String!
    isActive: Boolean!
    startDate: String!
    endDate: String
    cancelledAt: String
    trialEndsAt: String
    category: String
    notes: String
    paymentMethod: String
    url: String
    monthlyCost: Float!
    createdAt: String!
    updatedAt: String!
  }

  type SubscriptionsResult {
    items: [Subscription!]!
    totalCount: Int!
  }

  enum SubscriptionSortField {
    NAME
    MONTHLY_COST
    NEXT_RENEWAL
  }

  enum SortOrder {
    ASC
    DESC
  }

  input CreateSubscriptionInput {
    name: String!
    amount: Float!
    billingCycle: String!
    startDate: String!
    endDate: String
    trialEndsAt: String
    category: String
    notes: String
    paymentMethod: String
    url: String
  }

  input UpdateSubscriptionInput {
    id: ID!
    name: String!
    amount: Float!
    billingCycle: String!
    startDate: String!
    endDate: String
    trialEndsAt: String
    category: String
    notes: String
    paymentMethod: String
    url: String
  }

  extend type Query {
    subscriptions(page: Int, pageSize: Int, active: Boolean, sortBy: SubscriptionSortField, sortOrder: SortOrder): SubscriptionsResult!
  }

  input ResumeSubscriptionInput {
    id: ID!
    startDate: String
    amount: Float
    billingCycle: String
  }

  extend type Mutation {
    createSubscription(input: CreateSubscriptionInput!): Subscription!
    updateSubscription(input: UpdateSubscriptionInput!): Subscription!
    cancelSubscription(id: ID!): Subscription!
    resumeSubscription(input: ResumeSubscriptionInput!): Subscription!
    deleteSubscription(id: ID!): Boolean!
  }
`;
