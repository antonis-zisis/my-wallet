import { gql } from '@apollo/client';

export const GET_REPORTS = gql`
  query GetReports(
    $page: Int
    $pageSize: Int
    $search: String
    $sortBy: ReportSortField
    $sortOrder: SortOrder
  ) {
    reports(
      page: $page
      pageSize: $pageSize
      search: $search
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      items {
        id
        isLocked
        members {
          email
          fullName
          id
          role
          userId
        }
        myRole
        netBalance
        title
        transactionCount
        createdAt
        updatedAt
      }
      totalCount
    }
  }
`;

export const GET_REPORT = gql`
  query GetReport($id: ID!) {
    report(id: $id) {
      id
      isLocked
      members {
        email
        fullName
        id
        role
        userId
      }
      myRole
      title
      createdAt
      updatedAt
      transactions {
        id
        reportId
        type
        amount
        description
        category
        date
        createdById
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_REPORTS_SUMMARY = gql`
  query GetReportsSummary {
    reports(pageSize: 12) {
      items {
        id
        title
        transactions {
          type
          amount
        }
      }
      totalCount
    }
  }
`;
