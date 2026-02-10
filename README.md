# My Wallet

A full-stack Wallet application to help with budgeting built with React and Express.

## Tech Stack

### Frontend

- React 19
- React Router 7
- Vite 7
- Tailwind CSS 4
- TypeScript
- Apollo Client (GraphQL)
- Vitest

### Backend

- Express 5
- Apollo Server (GraphQL)
- Prisma (ORM)
- PostgreSQL
- TypeScript
- Vitest

### Tooling

- pnpm (monorepo with workspaces)
- ESLint 9
- Prettier
- Husky (git hooks)
- Commitlint (conventional commits)
- Lint-staged

## Prerequisites

- Node.js 24+
- pnpm 10+

## Getting Started

### Install dependencies

```bash
pnpm install
```

### Decrypt environment files

Environment files are encrypted in the repository. Decrypt them before running:

```bash
pnpm run env:decrypt
```

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

Run both frontend and backend in development mode:

```bash
pnpm dev
```

Or run them individually:

```bash
pnpm dev:frontend  # Starts frontend on http://localhost:3000
pnpm dev:backend   # Starts backend on http://localhost:4000
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

## Features

- **Reports**: Create and manage budget reports, each containing its own set of transactions
- **Transaction Management**: Add income and expense transactions with categories within a report
- **Category Support**: Pre-defined categories for both income (Salary, Freelance, Investment, Gift, Other) and expenses (Food, Transport, Utilities, Entertainment, Shopping, Health, Other)
- **Dark Mode**: Theme toggle with local storage persistence

## Project Structure

```text
my-wallet/
├── .husky/                # Git hooks
├── packages/
│   ├── backend/           # Express + Apollo Server backend app
│   └── frontend/          # React + Vite web app
├── scripts/               # Bootstrap and Utility scripts
├── commitlint.config.js   # Conventional commits config
├── eslint.config.js       # ESLint config
├── lint-staged.config.js  # Lint-staged config
└── package.json           # Root package.json
```

## GraphQL API

The backend exposes a GraphQL endpoint at `/graphql`.

### Development

When running in development mode, you can access the Apollo Sandbox at `http://localhost:4000/graphql`.

## Environment Files

Environment files (`.env`) are encrypted using GPG for secure storage in the repository.

### Decrypt

```bash
pnpm run env:decrypt
```

### Encrypt

Before committing changes to environment files:

```bash
pnpm run env:encrypt
```

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
- `fix(frontend): resolve login form validation`
- `docs: update README with setup instructions`
