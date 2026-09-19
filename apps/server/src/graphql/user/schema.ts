export const userTypeDefs = `#graphql
  type User {
    id: ID!
    supabaseId: String!
    email: String!
    fullName: String
    currency: String!
    createdAt: String!
    updatedAt: String!
  }

  input UpdateUserInput {
    fullName: String
    currency: String
  }

  extend type Query {
    me: User!
  }

  extend type Mutation {
    updateMe(input: UpdateUserInput!): User!
  }
`;
