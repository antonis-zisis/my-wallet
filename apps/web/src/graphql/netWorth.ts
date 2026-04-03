import { gql } from '@apollo/client';

export const GET_NET_WORTH_SNAPSHOTS = gql`
  query GetNetWorthSnapshots($page: Int) {
    netWorthSnapshots(page: $page) {
      items {
        id
        title
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

export const DELETE_NET_WORTH_SNAPSHOT = gql`
  mutation DeleteNetWorthSnapshot($id: ID!) {
    deleteNetWorthSnapshot(id: $id)
  }
`;
