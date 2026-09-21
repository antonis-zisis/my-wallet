import { gql } from '@apollo/client';

const ADMIN_USER_FIELDS = `
  counts {
    contracts
    netWorthSnapshots
    reports
    sharedOwnedReports
    sharedReports
    subscriptions
    transactions
  }
  createdAt
  currency
  email
  fullName
  lastSeenAt
  onboardingCompletedAt
  role
  supabaseId
`;

export const GET_ADMIN_USERS = gql`
  query GetAdminUsers(
    $page: Int
    $pageSize: Int
    $search: String
    $sortBy: AdminUserSortField
    $sortOrder: SortOrder
  ) {
    adminUsers(
      page: $page
      pageSize: $pageSize
      search: $search
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      items {
        ${ADMIN_USER_FIELDS}
      }
      totalCount
    }
  }
`;

export const GET_ADMIN_USER = gql`
  query GetAdminUser($supabaseId: String!) {
    adminUser(supabaseId: $supabaseId) {
      ${ADMIN_USER_FIELDS}
    }
  }
`;

export const ADMIN_DELETE_USER = gql`
  mutation AdminDeleteUser($input: AdminDeleteUserInput!) {
    adminDeleteUser(input: $input)
  }
`;

export const GET_ADMIN_INSIGHTS = gql`
  query GetAdminInsights {
    adminInsights {
      activeUsers24h
      activeUsers30d
      activeUsers7d
      onboardingFunnel {
        completed
        total
        withContract
        withFullName
        withNetWorthSnapshot
        withSubscription
        withTransaction
      }
      registeredUsers
      signupsByWeek {
        count
        week
      }
    }
  }
`;
