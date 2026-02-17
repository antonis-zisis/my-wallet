import 'dotenv/config';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import cors from 'cors';
import express, { type Express } from 'express';

import { resolvers, typeDefs } from './graphql/index';
import { connectDatabase } from './lib/prisma';
import { authMiddleware } from './middleware/auth';

const app: Express = express();
const PORT = process.env.PORT || 4000;

async function startServer() {
  const dbConnected = await connectDatabase();

  if (!dbConnected) {
    console.warn('Server starting without database connection');
  }

  const server = new ApolloServer({ typeDefs, resolvers });

  await server.start();

  const allowedOrigins = [
    'https://my-wallet.antoniszisis.com/',
    'https://az-my-wallet.netlify.app',
    'http://localhost:3000',
  ];

  app.use(cors({ origin: allowedOrigins }));
  app.use(express.json());

  app.use('/graphql', authMiddleware, expressMiddleware(server));

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
  });
}

startServer();

export default app;
