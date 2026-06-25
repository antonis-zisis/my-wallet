import { gql } from '@apollo/client';

export const GET_NET_WORTH_SNAPSHOTS = gql`
  query GetNetWorthSnapshots(
    $page: Int
    $pageSize: Int
    $search: String
    $sortBy: NetWorthSnapshotSortField
    $sortOrder: SortOrder
  ) {
    netWorthSnapshots(
      page: $page
      pageSize: $pageSize
      search: $search
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      items {
        id
        title
        snapshotDate
        totalAssets
        totalLiabilities
        netWorth
        previousSnapshot {
          netWorth
        }
        entries {
          id
          type
          label
          amount
          category
        }
        createdAt
      }
      totalCount
    }
  }
`;

export const GET_NET_WORTH_TREND = gql`
  query GetNetWorthTrend($pageSize: Int) {
    netWorthSnapshots(page: 1, pageSize: $pageSize) {
      items {
        id
        title
        snapshotDate
        totalAssets
        totalLiabilities
        netWorth
        createdAt
      }
      totalCount
    }
  }
`;

export const GET_NET_WORTH_SNAPSHOT = gql`
  query GetNetWorthSnapshot($id: ID!) {
    netWorthSnapshot(id: $id) {
      id
      title
      snapshotDate
      totalAssets
      totalLiabilities
      netWorth
      entries {
        id
        type
        label
        amount
        category
        notes
      }
      previousSnapshot {
        totalAssets
        totalLiabilities
        netWorth
        entries {
          type
          label
          amount
          category
          notes
        }
      }
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_NET_WORTH_SNAPSHOT = gql`
  mutation CreateNetWorthSnapshot($input: CreateNetWorthSnapshotInput!) {
    createNetWorthSnapshot(input: $input) {
      id
      title
      snapshotDate
      totalAssets
      totalLiabilities
      netWorth
      createdAt
    }
  }
`;

export const UPDATE_NET_WORTH_SNAPSHOT = gql`
  mutation UpdateNetWorthSnapshot(
    $id: ID!
    $input: UpdateNetWorthSnapshotInput!
  ) {
    updateNetWorthSnapshot(id: $id, input: $input) {
      id
      title
      snapshotDate
      totalAssets
      totalLiabilities
      netWorth
      entries {
        id
        type
        label
        amount
        category
        notes
      }
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_NET_WORTH_SNAPSHOT = gql`
  mutation DeleteNetWorthSnapshot($id: ID!) {
    deleteNetWorthSnapshot(id: $id)
  }
`;
