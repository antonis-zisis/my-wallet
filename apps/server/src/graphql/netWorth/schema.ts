export const netWorthTypeDefs = `#graphql
  type NetWorthEntry {
    id: ID!
    type: String!
    label: String!
    amount: Float!
    category: String!
    createdAt: String!
    updatedAt: String!
  }

  type NetWorthSnapshot {
    id: ID!
    title: String!
    totalAssets: Float!
    totalLiabilities: Float!
    netWorth: Float!
    entries: [NetWorthEntry!]!
    previousSnapshot: NetWorthSnapshot
    createdAt: String!
    updatedAt: String!
  }

  type NetWorthSnapshotsResult {
    items: [NetWorthSnapshot!]!
    totalCount: Int!
  }

  input NetWorthEntryInput {
    type: String!
    label: String!
    amount: Float!
    category: String!
  }

  input CreateNetWorthSnapshotInput {
    title: String!
    entries: [NetWorthEntryInput!]!
  }

  input UpdateNetWorthSnapshotInput {
    title: String!
    entries: [NetWorthEntryInput!]!
  }

  extend type Query {
    netWorthSnapshots(page: Int, pageSize: Int): NetWorthSnapshotsResult!
    netWorthSnapshot(id: ID!): NetWorthSnapshot
  }

  extend type Mutation {
    createNetWorthSnapshot(input: CreateNetWorthSnapshotInput!): NetWorthSnapshot!
    updateNetWorthSnapshot(id: ID!, input: UpdateNetWorthSnapshotInput!): NetWorthSnapshot!
    deleteNetWorthSnapshot(id: ID!): Boolean!
  }
`;
