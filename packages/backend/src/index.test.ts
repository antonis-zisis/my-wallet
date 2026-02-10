import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from './index';

describe('GraphQL API', () => {
  describe('health query', () => {
    it('returns health status', async () => {
      const response = await request(app).post('/graphql').send({
        query: '{ health }',
      });

      expect(response.status).toBe(200);
      expect(response.body.data.health).toBe('GraphQL server is running!');
    });
  });

  describe('transactions query', () => {
    it('returns empty array when no transactions', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            query {
              transactions {
                id
                type
                amount
                description
                category
                date
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.transactions).toEqual([]);
    });
  });

  describe('transaction query', () => {
    it('returns null for non-existent transaction', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            query GetTransaction($id: ID!) {
              transaction(id: $id) {
                id
                type
                amount
              }
            }
          `,
          variables: { id: 'non-existent-id' },
        });

      expect(response.status).toBe(200);
      expect(response.body.data.transaction).toBeNull();
    });
  });

  describe('createTransaction mutation', () => {
    const validInput = {
      type: 'EXPENSE',
      amount: 50.25,
      description: 'Grocery shopping',
      category: 'Food',
      date: '2024-01-15',
    };

    it('creates an expense transaction', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            mutation CreateTransaction($input: CreateTransactionInput!) {
              createTransaction(input: $input) {
                id
                type
                amount
                description
                category
                date
                createdAt
                updatedAt
              }
            }
          `,
          variables: { input: validInput },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();

      const transaction = response.body.data.createTransaction;
      expect(transaction.id).toBeDefined();
      expect(transaction.type).toBe('EXPENSE');
      expect(transaction.amount).toBe(50.25);
      expect(transaction.description).toBe('Grocery shopping');
      expect(transaction.category).toBe('Food');
      expect(transaction.date).toBe('2024-01-15');
      expect(transaction.createdAt).toBeDefined();
      expect(transaction.updatedAt).toBeDefined();
    });

    it('creates an income transaction', async () => {
      const incomeInput = {
        type: 'INCOME',
        amount: 1000,
        description: 'Monthly salary',
        category: 'Salary',
        date: '2024-01-01',
      };

      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            mutation CreateTransaction($input: CreateTransactionInput!) {
              createTransaction(input: $input) {
                id
                type
                amount
                description
                category
              }
            }
          `,
          variables: { input: incomeInput },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();

      const transaction = response.body.data.createTransaction;
      expect(transaction.type).toBe('INCOME');
      expect(transaction.amount).toBe(1000);
      expect(transaction.description).toBe('Monthly salary');
    });

    it('rejects invalid transaction type', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            mutation CreateTransaction($input: CreateTransactionInput!) {
              createTransaction(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: { ...validInput, type: 'INVALID' },
          },
        });

      // GraphQL validation errors return 400
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('requires all input fields', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            mutation CreateTransaction($input: CreateTransactionInput!) {
              createTransaction(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: { type: 'EXPENSE' },
          },
        });

      // GraphQL validation errors return 400
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('deleteTransaction mutation', () => {
    it('returns true when deleting a transaction', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            mutation DeleteTransaction($id: ID!) {
              deleteTransaction(id: $id)
            }
          `,
          variables: { id: 'some-id' },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.deleteTransaction).toBe(true);
    });
  });
});
