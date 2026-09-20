export const billingTypeDefs = `#graphql
  enum BillingInterval {
    MONTH
    YEAR
  }

  type PlanPrice {
    amount: Int!
    currency: String!
    interval: BillingInterval!
  }

  type CheckoutSession {
    url: String!
  }

  type BillingPortalSession {
    url: String!
  }

  input CreateCheckoutSessionInput {
    interval: BillingInterval!
  }

  extend type Query {
    planPrices: [PlanPrice!]!
  }

  extend type Mutation {
    createCheckoutSession(input: CreateCheckoutSessionInput!): CheckoutSession!
    createBillingPortalSession: BillingPortalSession!
  }
`;
