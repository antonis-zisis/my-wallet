import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../src/generated/prisma/client.js';

const host = process.env['PG_HOST'] || 'localhost';
const port = parseInt(process.env['PG_PORT'] || '5432');
const user = process.env['PG_USER'];
const password = process.env['PG_PASSWORD'];
const database = process.env['PG_DATABASE'];

const connectionString = `postgresql://${user}:${password}@${host}:${port}/${database}?schema=public`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const PLACEHOLDER_USER_ID = process.env['SEED_USER_ID'];

if (!PLACEHOLDER_USER_ID) {
  console.error('Error: SEED_USER_ID environment variable is required.');
  process.exit(1);
}

async function main() {
  console.log('Seeding database...');

  const user = await prisma.user.upsert({
    where: { supabaseId: PLACEHOLDER_USER_ID },
    update: {},
    create: {
      supabaseId: PLACEHOLDER_USER_ID!,
      email: 'dev@example.com',
      fullName: 'Dev User',
    },
  });

  console.log(`Upserted user: ${user.email}`);

  const marchReport = await prisma.report.upsert({
    where: { id: 'seed-report-march-2026' },
    update: {},
    create: {
      id: 'seed-report-march-2026',
      title: 'March 2026',
      userId: PLACEHOLDER_USER_ID!,
      transactions: {
        createMany: {
          skipDuplicates: true,
          data: [
            {
              id: 'seed-tx-1',
              type: 'INCOME',
              amount: 4500,
              description: 'Monthly salary',
              category: 'Salary',
              date: new Date('2026-03-01'),
            },
            {
              id: 'seed-tx-2',
              type: 'INCOME',
              amount: 300,
              description: 'Freelance project',
              category: 'Freelance',
              date: new Date('2026-03-10'),
            },
            {
              id: 'seed-tx-3',
              type: 'EXPENSE',
              amount: 1200,
              description: 'Monthly rent',
              category: 'Housing',
              date: new Date('2026-03-01'),
            },
            {
              id: 'seed-tx-4',
              type: 'EXPENSE',
              amount: 180,
              description: 'Weekly groceries',
              category: 'Food',
              date: new Date('2026-03-05'),
            },
            {
              id: 'seed-tx-5',
              type: 'EXPENSE',
              amount: 60,
              description: 'Electric bill',
              category: 'Utilities',
              date: new Date('2026-03-08'),
            },
            {
              id: 'seed-tx-6',
              type: 'EXPENSE',
              amount: 45,
              description: 'Gym membership',
              category: 'Health',
              date: new Date('2026-03-01'),
            },
            {
              id: 'seed-tx-7',
              type: 'EXPENSE',
              amount: 90,
              description: 'Dinner and drinks',
              category: 'Entertainment',
              date: new Date('2026-03-15'),
            },
            {
              id: 'seed-tx-8',
              type: 'EXPENSE',
              amount: 35,
              description: 'Bus pass',
              category: 'Transport',
              date: new Date('2026-03-03'),
            },
          ],
        },
      },
    },
  });

  const februaryReport = await prisma.report.upsert({
    where: { id: 'seed-report-february-2026' },
    update: {},
    create: {
      id: 'seed-report-february-2026',
      title: 'February 2026',
      isLocked: true,
      userId: PLACEHOLDER_USER_ID!,
      transactions: {
        createMany: {
          skipDuplicates: true,
          data: [
            {
              id: 'seed-tx-9',
              type: 'INCOME',
              amount: 4500,
              description: 'Monthly salary',
              category: 'Salary',
              date: new Date('2026-02-01'),
            },
            {
              id: 'seed-tx-10',
              type: 'EXPENSE',
              amount: 1200,
              description: 'Monthly rent',
              category: 'Housing',
              date: new Date('2026-02-01'),
            },
            {
              id: 'seed-tx-11',
              type: 'EXPENSE',
              amount: 220,
              description: 'Weekly groceries',
              category: 'Food',
              date: new Date('2026-02-07'),
            },
            {
              id: 'seed-tx-12',
              type: 'EXPENSE',
              amount: 55,
              description: 'Internet bill',
              category: 'Utilities',
              date: new Date('2026-02-10'),
            },
            {
              id: 'seed-tx-13',
              type: 'EXPENSE',
              amount: 120,
              description: 'Flight booking',
              category: 'Travel',
              date: new Date('2026-02-20'),
            },
          ],
        },
      },
    },
  });

  console.log(
    `Upserted reports: "${marchReport.title}", "${februaryReport.title}"`
  );

  const subscriptions = await Promise.all([
    prisma.subscription.upsert({
      where: { id: 'seed-sub-1' },
      update: {},
      create: {
        id: 'seed-sub-1',
        name: 'Netflix',
        amount: 15.99,
        billingCycle: 'MONTHLY',
        isActive: true,
        startDate: new Date('2024-01-01'),
        userId: PLACEHOLDER_USER_ID!,
      },
    }),
    prisma.subscription.upsert({
      where: { id: 'seed-sub-2' },
      update: {},
      create: {
        id: 'seed-sub-2',
        name: 'Spotify',
        amount: 9.99,
        billingCycle: 'MONTHLY',
        isActive: true,
        startDate: new Date('2024-03-01'),
        userId: PLACEHOLDER_USER_ID!,
      },
    }),
    prisma.subscription.upsert({
      where: { id: 'seed-sub-3' },
      update: {},
      create: {
        id: 'seed-sub-3',
        name: 'GitHub',
        amount: 4,
        billingCycle: 'MONTHLY',
        isActive: true,
        startDate: new Date('2023-06-01'),
        userId: PLACEHOLDER_USER_ID!,
      },
    }),
    prisma.subscription.upsert({
      where: { id: 'seed-sub-4' },
      update: {},
      create: {
        id: 'seed-sub-4',
        name: 'iCloud Storage',
        amount: 0.99,
        billingCycle: 'MONTHLY',
        isActive: true,
        startDate: new Date('2022-01-01'),
        userId: PLACEHOLDER_USER_ID!,
      },
    }),
    prisma.subscription.upsert({
      where: { id: 'seed-sub-5' },
      update: {},
      create: {
        id: 'seed-sub-5',
        name: '1Password',
        amount: 36,
        billingCycle: 'YEARLY',
        isActive: true,
        startDate: new Date('2024-05-01'),
        userId: PLACEHOLDER_USER_ID!,
      },
    }),
  ]);

  console.log(`Upserted ${subscriptions.length} subscriptions`);

  const netWorthSnapshot = await prisma.netWorthSnapshot.upsert({
    where: { id: 'seed-networth-q1-2026' },
    update: {},
    create: {
      id: 'seed-networth-q1-2026',
      title: 'Q1 2026',
      userId: PLACEHOLDER_USER_ID!,
      entries: {
        createMany: {
          skipDuplicates: true,
          data: [
            {
              id: 'seed-nw-1',
              type: 'ASSET',
              label: 'Checking Account',
              amount: 3200,
              category: 'Cash',
            },
            {
              id: 'seed-nw-2',
              type: 'ASSET',
              label: 'Savings Account',
              amount: 12000,
              category: 'Savings',
            },
            {
              id: 'seed-nw-3',
              type: 'ASSET',
              label: 'Investment Portfolio',
              amount: 25000,
              category: 'Investments',
            },
            {
              id: 'seed-nw-4',
              type: 'LIABILITY',
              label: 'Credit Card',
              amount: 1400,
              category: 'Credit Card',
            },
            {
              id: 'seed-nw-5',
              type: 'LIABILITY',
              label: 'Car Loan',
              amount: 8500,
              category: 'Car Loan',
            },
          ],
        },
      },
    },
  });

  console.log(`Upserted net worth snapshot: "${netWorthSnapshot.title}"`);
  console.log('Seeding complete.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
