import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from './index.js';

describe('Backend API', () => {
  describe('GET /api/health', () => {
    it('returns health status', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Backend is running!' });
    });
  });

  describe('POST /api/transactions', () => {
    const validTransaction = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      type: 'expense',
      amount: 50.25,
      description: 'Grocery shopping',
      category: 'Food',
      date: '2024-01-15',
    };

    it('accepts a valid expense transaction', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .send(validTransaction);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });

    it('accepts a valid income transaction', async () => {
      const incomeTransaction = {
        ...validTransaction,
        type: 'income',
        description: 'Monthly salary',
        category: 'Salary',
      };

      const response = await request(app)
        .post('/api/transactions')
        .send(incomeTransaction);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });

    it('rejects transaction without id', async () => {
      const response = await request(app).post('/api/transactions').send({
        type: validTransaction.type,
        amount: validTransaction.amount,
        description: validTransaction.description,
        category: validTransaction.category,
        date: validTransaction.date,
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid or missing id' });
    });

    it('rejects transaction with invalid type', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .send({ ...validTransaction, type: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Type must be "income" or "expense"',
      });
    });

    it('rejects transaction without type', async () => {
      const response = await request(app).post('/api/transactions').send({
        id: validTransaction.id,
        amount: validTransaction.amount,
        description: validTransaction.description,
        category: validTransaction.category,
        date: validTransaction.date,
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Type must be "income" or "expense"',
      });
    });

    it('rejects transaction with non-positive amount', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .send({ ...validTransaction, amount: 0 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Amount must be a positive number',
      });
    });

    it('rejects transaction with negative amount', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .send({ ...validTransaction, amount: -10 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Amount must be a positive number',
      });
    });

    it('rejects transaction without amount', async () => {
      const response = await request(app).post('/api/transactions').send({
        id: validTransaction.id,
        type: validTransaction.type,
        description: validTransaction.description,
        category: validTransaction.category,
        date: validTransaction.date,
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Amount must be a positive number',
      });
    });

    it('rejects transaction without description', async () => {
      const response = await request(app).post('/api/transactions').send({
        id: validTransaction.id,
        type: validTransaction.type,
        amount: validTransaction.amount,
        category: validTransaction.category,
        date: validTransaction.date,
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Invalid or missing description',
      });
    });

    it('rejects transaction with empty description', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .send({ ...validTransaction, description: '' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Invalid or missing description',
      });
    });

    it('rejects transaction without category', async () => {
      const response = await request(app).post('/api/transactions').send({
        id: validTransaction.id,
        type: validTransaction.type,
        amount: validTransaction.amount,
        description: validTransaction.description,
        date: validTransaction.date,
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid or missing category' });
    });

    it('rejects transaction without date', async () => {
      const response = await request(app).post('/api/transactions').send({
        id: validTransaction.id,
        type: validTransaction.type,
        amount: validTransaction.amount,
        description: validTransaction.description,
        category: validTransaction.category,
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid or missing date' });
    });

    it('accepts transaction with decimal amount', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .send({ ...validTransaction, amount: 99.99 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });
  });
});
