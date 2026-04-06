# My Wallet

[![Deploy](https://github.com/antonis-zisis/my-wallet/actions/workflows/deploy.yml/badge.svg)](https://github.com/antonis-zisis/my-wallet/actions/workflows/deploy.yml)

A personal budgeting app built with React and Express.

[my-wallet.antoniszisis.com](https://my-wallet.antoniszisis.com)

> **Status:** The hosted app is currently invite-only while under active development. Public registration is not yet available.

## Tech Stack

|             |                                                                                |
| ----------- | ------------------------------------------------------------------------------ |
| **Web**     | React 19 · React Router 7 · Vite 8 · Tailwind CSS 4 · Apollo Client · Recharts |
| **Server**  | Express 5 · Apollo Server · Prisma · PostgreSQL                                |
| **Shared**  | TypeScript · Supabase · Vitest                                                 |
| **Tooling** | pnpm workspaces · ESLint 10 · Prettier · Husky · Commitlint · Lint-staged      |

## Prerequisites

- Node.js 24+
- pnpm 10+

## Getting Started

### Install dependencies

```bash
pnpm install
```

### Set up environment files

**If you cloned this repo and have the GPG key:**

```bash
pnpm run env:decrypt
```

**If you are self-hosting a fork:** copy the `.env.sample` files in `apps/web` and `apps/server` to `.env` and fill in your own values. See [Environment Variables](#environment-variables) below for what is required.

### Set up the database

Run the bootstrap script to create the database, user, and run migrations:

```bash
./scripts/bootstrap-db.sh
```

This script will prompt for the PostgreSQL superuser password and automatically:

- Create the database user and database
- Generate the Prisma client
- Run any pending migrations

### Development

Run both web and server in development mode:

```bash
pnpm dev
```

Or run them individually:

```bash
pnpm dev:web     # Starts web on http://localhost:3000
pnpm dev:server  # Starts server on http://localhost:4000
```

### Build

```bash
pnpm build
```

### Testing

```bash
pnpm test
```

### Linting

```bash
pnpm lint
```

### Formatting

```bash
pnpm format
```

### Type Checking

```bash
pnpm typecheck
```

## Features

- **Reports**: Create and manage budget reports, each containing its own set of transactions
- **Transaction Management**: Add income and expense transactions with categories within a report
- **Subscriptions**: Track recurring payments (Netflix, Spotify, etc.) with monthly/yearly billing cycles, next renewal date calculation, cost equivalents (yearly for monthly, monthly for yearly), cancel or delete subscriptions, and view total monthly cost
- **Net Worth**: Track your financial position by creating snapshots of assets and liabilities, with automatic net worth calculation and paginated snapshot history
- **Charts**: Income & expenses grouped bar chart on the Home dashboard (last 12 reports); expense breakdown pie chart on the Report page
- **Authentication**: Login-only access with Supabase Auth, session-based authentication, and JWT-protected API

## Project Structure

```text
my-wallet/
├── .husky/                # Git hooks
├── apps/
│   ├── server/            # Express + Apollo Server app
│   └── web/               # React + Vite web app
├── scripts/               # Bootstrap and utility scripts
├── commitlint.config.js   # Conventional commits config
├── eslint.config.js       # ESLint config
├── lint-staged.config.js  # Lint-staged config
└── package.json           # Root package.json
```

## GraphQL API

The server exposes a GraphQL endpoint at `/graphql`.

When running in development mode, you can access the Apollo Sandbox at `http://localhost:4000/graphql`.

## Environment Variables

Environment files (`.env`) are encrypted using GPG for secure storage in the repository. `.env.sample` files are provided in each app as a reference.

### Required variables

- **Server** (`apps/server/.env`): `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, and `PG_*` database connection variables
- **Web** (`apps/web/.env`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

### Encrypt before committing (repo maintainer only)

```bash
pnpm run env:encrypt
```

## Deployment

Deployment is handled via GitHub Actions (`.github/workflows/deploy.yml`), triggered on GitHub release:

1. **Test** — lint, typecheck, and run tests
2. **Migrate** — run Prisma database migrations
3. **Deploy server** — build Docker image and deploy to Google Cloud Run
4. **Deploy web** — build and deploy to Netlify

## Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Commit messages must follow the format:

```text
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

Examples:

- `feat: add user authentication`
- `fix(web): resolve login form validation`
- `docs: update README with setup instructions`

## License

This project is licensed under the [Elastic License 2.0](LICENSE).

You are free to use, fork, and self-host this software for personal use. You may not sell it or offer it as a hosted service to others.
