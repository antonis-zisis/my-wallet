import { PrismaClient } from '../generated/prisma/client.js';

const prisma = new PrismaClient();

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
