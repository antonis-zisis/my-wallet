import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../generated/prisma/client';

const host = process.env['PG_HOST'] || 'localhost';
const port = process.env['PG_PORT'] || '5432';
const user = process.env['PG_USER'];
const password = process.env['PG_PASSWORD'];
const database = process.env['PG_DATABASE'];

const connectionString = `postgresql://${user}:${password}@${host}:${port}/${database}?schema=public`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export async function connectDatabase(): Promise<boolean> {
  try {
    await prisma.$connect();
    console.log('Database connection established successfully');
    return true;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    return false;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

export default prisma;
