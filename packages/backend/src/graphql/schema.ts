export const typeDefs = `#graphql
  enum TransactionType {
    INCOME
    EXPENSE
  }

  type Transaction {
    id: ID!
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
    createdAt: String!
    updatedAt: String!
  }

  input CreateTransactionInput {
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
    reports: [Report!]!
    report(id: ID!): Report
    health: String!
  }

  type Mutation {
    createTransaction(input: CreateTransactionInput!): Transaction!
    deleteTransaction(id: ID!): Boolean!
    createReport(input: CreateReportInput!): Report!
  }
`;
