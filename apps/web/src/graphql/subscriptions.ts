import { gql } from '@apollo/client';

export const GET_SUBSCRIPTIONS = gql`
  query GetSubscriptions($page: Int, $active: Boolean) {
    subscriptions(page: $page, active: $active) {
      items {
        id
        name
        amount
        billingCycle
        isActive
        startDate
        endDate
        monthlyCost
        createdAt
        updatedAt
      }
      totalCount
    }
  }
`;

export const CREATE_SUBSCRIPTION = gql`
  mutation CreateSubscription($input: CreateSubscriptionInput!) {
    createSubscription(input: $input) {
      id
      name
      amount
      billingCycle
      isActive
      startDate
      endDate
      monthlyCost
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_SUBSCRIPTION = gql`
  mutation UpdateSubscription($input: UpdateSubscriptionInput!) {
    updateSubscription(input: $input) {
      id
      name
      amount
      billingCycle
      isActive
      startDate
      endDate
      monthlyCost
      createdAt
      updatedAt
    }
  }
`;

export const CANCEL_SUBSCRIPTION = gql`
  mutation CancelSubscription($id: ID!) {
    cancelSubscription(id: $id) {
      id
      isActive
    }
  }
`;

export const DELETE_SUBSCRIPTION = gql`
  mutation DeleteSubscription($id: ID!) {
    deleteSubscription(id: $id)
  }
`;
