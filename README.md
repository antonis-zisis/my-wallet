# My Wallet

A full-stack wallet application built with React and Express.

## Tech Stack

### Frontend

- React 19
- Vite 7
- Tailwind CSS 4
- TypeScript
- Vitest

### Backend

- Express 5
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
- pnpm 9+

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

- **Transaction Management**: Add income and expense transactions with categories
- **Category Support**: Pre-defined categories for both income (Salary, Freelance, Investment, Gift, Other) and expenses (Food, Transport, Utilities, Entertainment, Shopping, Health, Other)
- **Transaction List**: View all transactions sorted by date with color-coded amounts

## Project Structure

```text
my-wallet/
├── packages/
│   ├── frontend/          # React + Vite frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── TransactionForm.tsx
│   │   │   │   └── TransactionList.tsx
│   │   │   ├── types/
│   │   │   │   └── transaction.ts
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   └── index.css
│   │   ├── index.html
│   │   └── vite.config.ts
│   └── backend/           # Express backend
│       └── src/
│           └── index.ts
├── .husky/                # Git hooks
├── commitlint.config.js   # Conventional commits config
├── lint-staged.config.js  # Lint-staged config
├── eslint.config.js       # ESLint config
└── package.json           # Root package.json
```

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
