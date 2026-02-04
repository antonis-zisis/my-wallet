import 'dotenv/config';
import express, { type Express } from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { connectDatabase } from './lib/prisma.js';
import { typeDefs, resolvers } from './graphql/index.js';

const app: Express = express();
const PORT = process.env.PORT || 4000;

async function startServer() {
  const dbConnected = await connectDatabase();

  if (!dbConnected) {
    console.warn('Server starting without database connection');
  }

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ message: 'Backend is running!' });
  });

  app.use('/graphql', expressMiddleware(server));

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
  });
}

startServer();

export default app;
