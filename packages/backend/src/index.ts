import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
}

const app: Express = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ message: 'Backend is running!' });
});

app.post('/api/transactions', (req: Request, res: Response) => {
  const { id, type, amount, description, category, date } =
    req.body as Transaction;

  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'Invalid or missing id' });
    return;
  }
  if (type !== 'income' && type !== 'expense') {
    res.status(400).json({ error: 'Type must be "income" or "expense"' });
    return;
  }
  if (typeof amount !== 'number' || amount <= 0) {
    res.status(400).json({ error: 'Amount must be a positive number' });
    return;
  }
  if (!description || typeof description !== 'string') {
    res.status(400).json({ error: 'Invalid or missing description' });
    return;
  }
  if (!category || typeof category !== 'string') {
    res.status(400).json({ error: 'Invalid or missing category' });
    return;
  }
  if (!date || typeof date !== 'string') {
    res.status(400).json({ error: 'Invalid or missing date' });
    return;
  }

  console.log('Transaction received:', {
    id,
    type,
    amount,
    description,
    category,
    date,
  });

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
