export const baseTypeDefs = `#graphql
  enum TransactionType {
    INCOME
    EXPENSE
  }

  type Query {
    health: String!
  }
`;
