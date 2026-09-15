import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../generated/prisma/client';
import { env } from './env';
import { retryWithBackoff } from './retryWithBackoff';

const CONNECT_ATTEMPTS = 3;
const CONNECT_RETRY_DELAY_MS = 1000;

// Supavisor caps session-mode clients per project, so keep room for the other
// Cloud Run instances that spin up alongside this one during a cold start.
const MAX_POOL_CONNECTIONS = 5;

const connectionString = `postgresql://${env.PG_USER}:${env.PG_PASSWORD}@${env.PG_HOST}:${env.PG_PORT}/${env.PG_DATABASE}?schema=public`;

const adapter = new PrismaPg({
  connectionString,
  max: MAX_POOL_CONNECTIONS,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  statement_timeout: 10000,
});

const prisma = new PrismaClient({ adapter });

export async function connectDatabase(): Promise<void> {
  await retryWithBackoff(() => prisma.$queryRaw`SELECT 1`, {
    attempts: CONNECT_ATTEMPTS,
    delayMs: CONNECT_RETRY_DELAY_MS,
    onRetry: () => console.warn('Database connection failed, retrying...'),
  });

  console.log('Database connection established successfully');
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

export default prisma;
