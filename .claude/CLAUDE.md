# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

My Wallet is a full-stack budgeting app — React frontend with an Express/GraphQL backend, organized as a pnpm monorepo.

## Commands

```bash
pnpm install              # Install dependencies
pnpm dev                  # Run both frontend and backend in dev mode
pnpm dev:frontend         # Frontend only (http://localhost:3000)
pnpm dev:backend          # Backend only (http://localhost:4000)
pnpm build                # Build all packages
pnpm test                 # Run all tests
pnpm lint                 # Lint all packages
pnpm format               # Format with Prettier

# Run tests for a single package
pnpm --filter frontend test
pnpm --filter backend test

# Run a single test file
pnpm --filter frontend exec vitest run src/pages/Home.test.tsx
pnpm --filter backend exec vitest run src/index.test.ts

# Prisma (run from packages/backend)
pnpm --filter backend db:generate    # Generate Prisma client
pnpm --filter backend db:migrate     # Run migrations
pnpm --filter backend db:studio      # Open Prisma Studio

# Environment files (GPG-encrypted in repo)
pnpm run env:decrypt      # Decrypt .env files
pnpm run env:encrypt      # Encrypt before committing
```

## Architecture

**Monorepo:** `packages/frontend` and `packages/backend`, managed by pnpm workspaces.

**Frontend** (React 19 + Vite 7 + Tailwind CSS 4):

- Entry: `main.tsx` → `ThemeProvider` → `AuthProvider` → `ApolloProvider` → `UserProvider` → `RouterProvider`
- Routing: React Router 7, `createBrowserRouter` in `router.tsx`. Root layout in `App.tsx` (NavBar + `<Outlet />`). Protected routes via `ProtectedRoute`
- GraphQL: Apollo Client 4 in `lib/apollo.ts`. Queries/mutations per domain in `graphql/`. Uses relative `/graphql` URI — Vite proxies to backend in dev
- Auth: `contexts/AuthContext.tsx` (`useAuth`) backed by Supabase Auth. User record in `contexts/UserContext.tsx` (`useUser`), lazily created via upsert on first `me` query
- UI primitives: `components/ui/` (Badge, Button, Card, Dropdown, Input, Modal, Select)
- Charts: Recharts in `components/charts/` — `ExpenseBreakdownChart` (PieChart) and `IncomeExpensesChart` (BarChart)

**Backend** (Express 5 + Apollo Server 5):

- Entry: `src/index.ts` — Apollo Server mounted at `/graphql` via `@as-integrations/express5`. Auth middleware validates Supabase JWT and extracts `userId` + `email` onto context
- GraphQL schema: SDL strings and resolvers per domain in `graphql/` subdirectories, re-exported from `graphql/index.ts`
- Database: PostgreSQL via Prisma 7 (`@prisma/adapter-pg`). Client generated to `src/generated/prisma/`. Uses `PG_*` env vars in `lib/prisma.ts`
- Build: tsup bundles to `dist/` for production

**Testing** (Vitest 4):

- Frontend: jsdom environment, setup in `src/test/setup.ts` (jest-dom matchers + `matchMedia` mock). Custom `MockedProvider` in `src/test/apollo-test-utils.tsx` for GraphQL mocking
- Backend: node environment, no special setup

## Rules

- **Never commit** unless the user explicitly asks for it.

## Conventions

- **Commits:** Conventional Commits — `type(scope): description`, enforced by commitlint + husky
- **ESLint:** `id-length` requires identifiers ≥ 2 characters (exception: `_`). Unused vars prefixed with `_` are allowed. `eslint-plugin-simple-import-sort` enforces sorted imports and exports
- **Lint-staged:** ESLint + Prettier on `*.{ts,tsx,js,jsx}`, Prettier on `*.{json,md,css,html}`
- **Prettier:** `prettier-plugin-tailwindcss` for class sorting
