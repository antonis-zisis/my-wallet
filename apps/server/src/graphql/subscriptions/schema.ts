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
    monthlyCost: Float!
    createdAt: String!
    updatedAt: String!
  }

  type SubscriptionsResult {
    items: [Subscription!]!
    totalCount: Int!
  }

  input CreateSubscriptionInput {
    name: String!
    amount: Float!
    billingCycle: String!
    startDate: String!
    endDate: String
  }

  input UpdateSubscriptionInput {
    id: ID!
    name: String!
    amount: Float!
    billingCycle: String!
    startDate: String!
    endDate: String
  }

  extend type Query {
    subscriptions(page: Int, pageSize: Int, active: Boolean): SubscriptionsResult!
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
