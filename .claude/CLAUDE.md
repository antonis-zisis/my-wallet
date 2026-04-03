# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

My Wallet is a full-stack budgeting app — React web app with an Express/GraphQL server, organized as a pnpm monorepo.

## Commands

```bash
pnpm install              # Install dependencies
pnpm dev                  # Run both web and server in dev mode
pnpm dev:web              # Web only (http://localhost:3000)
pnpm dev:server           # Server only (http://localhost:4000)
pnpm build                # Build all apps
pnpm test                 # Run all tests
pnpm lint                 # Lint all apps
pnpm format               # Format with Prettier

# Run tests for a single app
pnpm --filter my-wallet-web test
pnpm --filter my-wallet-server test

# Run a single test file
pnpm --filter my-wallet-web exec vitest run src/pages/Home.test.tsx
pnpm --filter my-wallet-server exec vitest run src/index.test.ts

# Prisma (run from apps/server)
pnpm --filter my-wallet-server db:generate    # Generate Prisma client
pnpm --filter my-wallet-server db:migrate     # Run migrations
pnpm --filter my-wallet-server db:studio      # Open Prisma Studio

# Environment files (GPG-encrypted in repo)
pnpm run env:decrypt      # Decrypt .env files
pnpm run env:encrypt      # Encrypt before committing
```

## Architecture

**Monorepo:** `apps/web` and `apps/server`, managed by pnpm workspaces.

**Web** (React 19 + Vite 7 + Tailwind CSS 4):

- Entry: `main.tsx` → `ThemeProvider` → `AuthProvider` → `ApolloProvider` → `UserProvider` → `RouterProvider`
- Routing: React Router 7, `createBrowserRouter` in `router.tsx`. Root layout in `App.tsx` (NavBar + `<Outlet />`). Protected routes via `ProtectedRoute`
- GraphQL: Apollo Client 4 in `lib/apollo.ts`. Queries/mutations per domain in `graphql/`. Uses relative `/graphql` URI — Vite proxies to server in dev
- Auth: `contexts/AuthContext.tsx` (`useAuth`) backed by Supabase Auth. User record in `contexts/UserContext.tsx` (`useUser`), lazily created via upsert on first `me` query
- UI primitives: `components/ui/` (Badge, Button, Card, Dropdown, Input, Modal, Select)
- Charts: Recharts in `components/charts/` — `ExpenseBreakdownChart` (PieChart) and `IncomeExpensesChart` (BarChart)

**Server** (Express 5 + Apollo Server 5):

- Entry: `src/index.ts` — Apollo Server mounted at `/graphql` via `@as-integrations/express5`. Auth middleware validates Supabase JWT and extracts `userId` + `email` onto context
- GraphQL schema: SDL strings and resolvers per domain in `graphql/` subdirectories, re-exported from `graphql/index.ts`
- Database: PostgreSQL via Prisma 7 (`@prisma/adapter-pg`). Client generated to `src/generated/prisma/`. Uses `PG_*` env vars in `lib/prisma.ts`
- Build: tsup bundles to `dist/` for production

**Testing** (Vitest 4):

- Web: jsdom environment, setup in `src/test/setup.ts` (jest-dom matchers + `matchMedia` mock). Custom `MockedProvider` in `src/test/apollo-test-utils.tsx` for GraphQL mocking
- Server: node environment, no special setup

## Rules

- **Never commit** unless the user explicitly asks for it.

## Conventions

- **Commits:** Conventional Commits — `type(scope): description`, enforced by commitlint + husky
- **ESLint:** `id-length` requires identifiers ≥ 2 characters (exception: `_`). Unused vars prefixed with `_` are allowed. `eslint-plugin-simple-import-sort` enforces sorted imports and exports. `eslint-plugin-sort-destructure-keys` enforces alphabetically sorted destructure keys
- **Lint-staged:** ESLint + Prettier on `*.{ts,tsx,js,jsx}`, Prettier on `*.{json,md,css,html}`
- **Prettier:** `prettier-plugin-tailwindcss` for class sorting
- **Naming:** Use full descriptive variable names — never abbreviate. e.g. `transaction` not `tx`, `subscription` not `sub`, `event` not `e`
