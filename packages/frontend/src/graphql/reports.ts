import { gql } from '@apollo/client';

export const GET_REPORTS = gql`
  query GetReports {
    reports {
      items {
        id
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
