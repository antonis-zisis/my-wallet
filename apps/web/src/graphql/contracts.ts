import { gql } from '@apollo/client';

export const GET_CONTRACTS = gql`
  query GetContracts(
    $page: Int
    $pageSize: Int
    $expired: Boolean
    $search: String
    $sortBy: ContractSortField
    $sortOrder: SortOrder
  ) {
    contracts(
      page: $page
      pageSize: $pageSize
      expired: $expired
      search: $search
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      items {
        category
        cost
        createdAt
        endDate
        id
        isExpired
        plan
        provider
        startDate
        updatedAt
      }
      totalCount
    }
  }
`;

export const CREATE_CONTRACT = gql`
  mutation CreateContract($input: CreateContractInput!) {
    createContract(input: $input) {
      category
      cost
      createdAt
      endDate
      id
      isExpired
      plan
      provider
      startDate
      updatedAt
    }
  }
`;

export const UPDATE_CONTRACT = gql`
  mutation UpdateContract($input: UpdateContractInput!) {
    updateContract(input: $input) {
      category
      cost
      createdAt
      endDate
      id
      isExpired
      plan
      provider
      startDate
      updatedAt
    }
  }
`;

export const DELETE_CONTRACT = gql`
  mutation DeleteContract($id: ID!) {
    deleteContract(id: $id)
  }
`;
