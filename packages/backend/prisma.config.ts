import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const host = process.env['PG_HOST'] || 'localhost';
const port = process.env['PG_PORT'] || '5432';
const user = process.env['PG_USER'];
const password = process.env['PG_PASSWORD'];
const database = process.env['PG_DATABASE'];

const databaseUrl = `postgresql://${user}:${password}@${host}:${port}/${database}?schema=public`;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: databaseUrl,
  },
});
