export const contractTypeDefs = `#graphql
  type Contract {
    id: ID!
    category: String!
    provider: String!
    plan: String
    startDate: String
    endDate: String
    cost: Float
    isExpired: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type ContractsResult {
    items: [Contract!]!
    totalCount: Int!
  }

  enum ContractSortField {
    END_DATE
    PROVIDER
  }

  input CreateContractInput {
    category: String!
    provider: String!
    plan: String
    startDate: String
    endDate: String
    cost: Float
  }

  input UpdateContractInput {
    id: ID!
    category: String!
    provider: String!
    plan: String
    startDate: String
    endDate: String
    cost: Float
  }

  extend type Query {
    contracts(page: Int, pageSize: Int, expired: Boolean, search: String, sortBy: ContractSortField, sortOrder: SortOrder): ContractsResult!
  }

  extend type Mutation {
    createContract(input: CreateContractInput!): Contract!
    updateContract(input: UpdateContractInput!): Contract!
    deleteContract(id: ID!): Boolean!
  }
`;
