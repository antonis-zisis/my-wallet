import { gql } from '@apollo/client';

export const GET_TRANSACTIONS = gql`
  query GetTransactions {
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
`;

export const GET_TRANSACTION = gql`
  query GetTransaction($id: ID!) {
    transaction(id: $id) {
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
`;

export const CREATE_TRANSACTION = gql`
  mutation CreateTransaction($input: CreateTransactionInput!) {
    createTransaction(input: $input) {
      id
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
`;

export const UPDATE_TRANSACTION = gql`
  mutation UpdateTransaction($input: UpdateTransactionInput!) {
    updateTransaction(input: $input) {
      id
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
`;

export const DELETE_TRANSACTION = gql`
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(id: $id)
  }
`;

export const GET_EXPENSE_CATEGORY_TOTALS_BY_MONTH = gql`
  query GetExpenseCategoryTotalsByMonth($months: Int) {
    expenseCategoryTotalsByMonth(months: $months) {
      category
      month
      total
    }
  }
`;
