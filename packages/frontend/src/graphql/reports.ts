import { gql } from '@apollo/client';

export const GET_REPORTS = gql`
  query GetReports {
    reports {
      id
      title
      createdAt
      updatedAt
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
