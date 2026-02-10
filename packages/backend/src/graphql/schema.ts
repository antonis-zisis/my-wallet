export const typeDefs = `#graphql
  enum TransactionType {
    INCOME
    EXPENSE
  }

  type Transaction {
    id: ID!
    reportId: ID!
    type: TransactionType!
    amount: Float!
    description: String!
    category: String!
    date: String!
    createdAt: String!
    updatedAt: String!
  }

  type Report {
    id: ID!
    title: String!
    transactions: [Transaction!]!
    createdAt: String!
    updatedAt: String!
  }

  type ReportsResult {
    items: [Report!]!
    totalCount: Int!
  }

  input CreateTransactionInput {
    reportId: ID!
    type: TransactionType!
    amount: Float!
    description: String!
    category: String!
    date: String!
  }

  input CreateReportInput {
    title: String!
  }

  type Query {
    transactions: [Transaction!]!
    transaction(id: ID!): Transaction
    reports: ReportsResult!
    report(id: ID!): Report
    health: String!
  }

  type Mutation {
    createTransaction(input: CreateTransactionInput!): Transaction!
    deleteTransaction(id: ID!): Boolean!
    createReport(input: CreateReportInput!): Report!
  }
`;
