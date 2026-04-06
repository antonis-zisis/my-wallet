import { gql } from '@apollo/client';

export const GET_REPORTS = gql`
  query GetReports($page: Int, $pageSize: Int) {
    reports(page: $page, pageSize: $pageSize) {
      items {
        id
        isLocked
        title
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
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_REPORTS_SUMMARY = gql`
  query GetReportsSummary {
    reports {
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

export const CREATE_REPORT = gql`
  mutation CreateReport($input: CreateReportInput!) {
    createReport(input: $input) {
      id
      title
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_REPORT = gql`
  mutation UpdateReport($input: UpdateReportInput!) {
    updateReport(input: $input) {
      id
      title
      updatedAt
    }
  }
`;

export const DELETE_REPORT = gql`
  mutation DeleteReport($id: ID!) {
    deleteReport(id: $id)
  }
`;

export const LOCK_REPORT = gql`
  mutation LockReport($id: ID!) {
    lockReport(id: $id) {
      id
      isLocked
    }
  }
`;

export const UNLOCK_REPORT = gql`
  mutation UnlockReport($id: ID!) {
    unlockReport(id: $id) {
      id
      isLocked
    }
  }
`;
