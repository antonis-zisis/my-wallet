interface CreateTransactionInput {
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  category: string;
  date: string;
}

export const resolvers = {
  Query: {
    transactions: () => {
      // TODO: Fetch from database
      return [];
    },
    transaction: (_parent: unknown, { id }: { id: string }) => {
      // TODO: Fetch from database
      console.log('Fetching transaction:', id);
      return null;
    },
    health: () => {
      return 'GraphQL server is running!';
    },
  },
  Mutation: {
    createTransaction: (
      _parent: unknown,
      { input }: { input: CreateTransactionInput }
    ) => {
      // TODO: Save to database
      console.log('Creating transaction:', input);
      const now = new Date().toISOString();
      return {
        id: crypto.randomUUID(),
        type: input.type,
        amount: input.amount,
        description: input.description,
        category: input.category,
        date: input.date,
        createdAt: now,
        updatedAt: now,
      };
    },
    deleteTransaction: (_parent: unknown, { id }: { id: string }) => {
      // TODO: Delete from database
      console.log('Deleting transaction:', id);
      return true;
    },
  },
};
