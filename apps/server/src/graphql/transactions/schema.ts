export const transactionTypeDefs = `#graphql
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
    createdById: String
    createdAt: String!
    updatedAt: String!
  }

  type CategoryMonthlyTotal {
    category: String!
    month: String!
    total: Float!
  }

  input CreateTransactionInput {
    reportId: ID!
    type: TransactionType!
    amount: Float!
    description: String!
    category: String!
    date: String!
  }

  input UpdateTransactionInput {
    id: ID!
    type: TransactionType!
    amount: Float!
    description: String!
    category: String!
    date: String!
  }

  extend type Query {
    transactions: [Transaction!]!
    transaction(id: ID!): Transaction
    expenseCategoryTotalsByMonth(months: Int): [CategoryMonthlyTotal!]!
  }

  type Mutation {
    createTransaction(input: CreateTransactionInput!): Transaction!
    updateTransaction(input: UpdateTransactionInput!): Transaction!
    deleteTransaction(id: ID!): Boolean!
  }
`;
