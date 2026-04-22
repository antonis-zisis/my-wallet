import { gql } from '@apollo/client';

export const GET_NET_WORTH_SNAPSHOTS = gql`
  query GetNetWorthSnapshots($page: Int, $pageSize: Int) {
    netWorthSnapshots(page: $page, pageSize: $pageSize) {
      items {
        id
        title
        totalAssets
        totalLiabilities
        netWorth
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

export const GET_NET_WORTH_SNAPSHOT = gql`
  query GetNetWorthSnapshot($id: ID!) {
    netWorthSnapshot(id: $id) {
      id
      title
      totalAssets
      totalLiabilities
      netWorth
      entries {
        id
        type
        label
        amount
        category
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
      totalAssets
      totalLiabilities
      netWorth
      entries {
        id
        type
        label
        amount
        category
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
