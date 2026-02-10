export const transactionTypeDefs = `#graphql
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

  input CreateTransactionInput {
    reportId: ID!
    type: TransactionType!
    amount: Float!
    description: String!
    category: String!
    date: String!
  }

  extend type Query {
    transactions: [Transaction!]!
    transaction(id: ID!): Transaction
  }

  type Mutation {
    createTransaction(input: CreateTransactionInput!): Transaction!
    deleteTransaction(id: ID!): Boolean!
  }
`;
