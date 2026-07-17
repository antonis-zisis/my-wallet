import { gql } from '@apollo/client';

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

export const SHARE_REPORT = gql`
  mutation ShareReport($input: ShareReportInput!) {
    shareReport(input: $input) {
      id
      members {
        email
        fullName
        id
        role
        userId
      }
    }
  }
`;

export const UPDATE_REPORT_SHARE_ROLE = gql`
  mutation UpdateReportShareRole($input: UpdateReportShareRoleInput!) {
    updateReportShareRole(input: $input) {
      id
      members {
        email
        fullName
        id
        role
        userId
      }
    }
  }
`;

export const UNSHARE_REPORT = gql`
  mutation UnshareReport($id: ID!) {
    unshareReport(id: $id) {
      id
      members {
        email
        fullName
        id
        role
        userId
      }
    }
  }
`;

export const LEAVE_SHARED_REPORT = gql`
  mutation LeaveSharedReport($reportId: ID!) {
    leaveSharedReport(reportId: $reportId)
  }
`;
