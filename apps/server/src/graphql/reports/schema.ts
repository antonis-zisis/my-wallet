export const reportTypeDefs = `#graphql
  type Report {
    id: ID!
    title: String!
    isLocked: Boolean!
    transactionCount: Int!
    netBalance: Float!
    transactions: [Transaction!]!
    members: [ReportMember!]!
    myRole: ReportRole!
    createdAt: String!
    updatedAt: String!
  }

  enum ReportRole {
    OWNER
    EDITOR
    VIEWER
  }

  type ReportMember {
    id: ID!
    userId: String!
    email: String!
    fullName: String
    role: ReportRole!
  }

  type ReportsResult {
    items: [Report!]!
    totalCount: Int!
  }

  enum ReportSortField {
    NEWEST
    NET_BALANCE
  }

  input CreateReportInput {
    title: String!
  }

  input UpdateReportInput {
    id: ID!
    title: String!
  }

  input ShareReportInput {
    reportId: ID!
    email: String!
    role: ReportRole!
  }

  input UpdateReportShareRoleInput {
    id: ID!
    role: ReportRole!
  }

  extend type Query {
    reports(page: Int, pageSize: Int, search: String, sortBy: ReportSortField, sortOrder: SortOrder): ReportsResult!
    report(id: ID!): Report
  }

  extend type Mutation {
    createReport(input: CreateReportInput!): Report!
    updateReport(input: UpdateReportInput!): Report!
    deleteReport(id: ID!): Boolean!
    lockReport(id: ID!): Report!
    unlockReport(id: ID!): Report!
    shareReport(input: ShareReportInput!): Report!
    updateReportShareRole(input: UpdateReportShareRoleInput!): Report!
    unshareReport(id: ID!): Report!
    leaveSharedReport(reportId: ID!): Boolean!
  }
`;
