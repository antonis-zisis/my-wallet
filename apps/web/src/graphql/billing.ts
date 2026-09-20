import { gql } from '@apollo/client';

export const GET_PLAN_PRICES = gql`
  query GetPlanPrices {
    planPrices {
      amount
      currency
      interval
    }
  }
`;

export const CREATE_CHECKOUT_SESSION = gql`
  mutation CreateCheckoutSession($input: CreateCheckoutSessionInput!) {
    createCheckoutSession(input: $input) {
      url
    }
  }
`;

export const CREATE_BILLING_PORTAL_SESSION = gql`
  mutation CreateBillingPortalSession {
    createBillingPortalSession {
      url
    }
  }
`;
