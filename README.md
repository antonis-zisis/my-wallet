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

- Node.js 20+
- pnpm 9+

## Getting Started

### Install dependencies

```bash
pnpm install
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

## Project Structure

```text
my-wallet/
├── packages/
│   ├── frontend/          # React + Vite frontend
│   │   ├── src/
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
