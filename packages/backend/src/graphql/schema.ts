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

  input CreateTransactionInput {
    type: TransactionType!
    amount: Float!
    description: String!
    category: String!
    date: String!
  }

  type Query {
    transactions: [Transaction!]!
    transaction(id: ID!): Transaction
    health: String!
  }

  type Mutation {
    createTransaction(input: CreateTransactionInput!): Transaction!
    deleteTransaction(id: ID!): Boolean!
  }
`;
