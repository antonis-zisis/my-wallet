import { gql } from '@apollo/client';

export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      fullName
    }
  }
`;

export const UPDATE_ME = gql`
  mutation UpdateMe($input: UpdateUserInput!) {
    updateMe(input: $input) {
      id
      email
      fullName
    }
  }
`;
