export const reportTypeDefs = `#graphql
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

  input CreateReportInput {
    title: String!
  }

  input UpdateReportInput {
    id: ID!
    title: String!
  }

  extend type Query {
    reports: ReportsResult!
    report(id: ID!): Report
  }

  extend type Mutation {
    createReport(input: CreateReportInput!): Report!
    updateReport(input: UpdateReportInput!): Report!
  }
`;
