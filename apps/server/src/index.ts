import 'dotenv/config';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import cors from 'cors';
import express, { type Express } from 'express';
import rateLimit from 'express-rate-limit';

import { resolvers, typeDefs } from './graphql/index';
import { createDepthLimitRule } from './lib/depthLimitRule';
import { connectDatabase } from './lib/prisma';
import { type AuthenticatedRequest, authMiddleware } from './middleware/auth';

const app: Express = express();
const PORT = process.env.PORT || 4000;
const isProduction = process.env.NODE_ENV === 'production';

const graphqlRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

async function startServer() {
  const dbConnected = await connectDatabase();

  if (!dbConnected) {
    console.warn('Server starting without database connection');
  }

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: !isProduction,
    includeStacktraceInErrorResponses: !isProduction,
    validationRules: [createDepthLimitRule(10)],
    formatError: (formattedError) => {
      if (
        isProduction &&
        formattedError.extensions?.code === 'INTERNAL_SERVER_ERROR'
      ) {
        return {
          message: 'Internal server error',
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        };
      }
      return formattedError;
    },
  });

  await server.start();

  const allowedOrigins = [
    'https://my-wallet.antoniszisis.com',
    'https://az-my-wallet.netlify.app',
    'http://localhost:3000',
  ];

  app.use(cors({ origin: allowedOrigins }));
  app.use(express.json());

  app.use(
    '/graphql',
    graphqlRateLimiter,
    authMiddleware,
    expressMiddleware(server, {
      context: async ({ req }) => ({
        userId: (req as AuthenticatedRequest).userId as string,
        email: (req as AuthenticatedRequest).email as string,
      }),
    })
  );

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
  });
}

startServer();

export default app;
