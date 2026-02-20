# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

**Monorepo layout:** `packages/frontend` and `packages/backend`, managed by pnpm workspaces.

**Frontend** (React 19 + Vite 7 + Tailwind CSS 4):

- Entry: `main.tsx` → wraps app in `ThemeProvider` → `ApolloProvider` → `RouterProvider`
- Routing: React Router 7 with `createBrowserRouter` in `router.tsx`. `App.tsx` is the root layout with `NavBar` + `<Outlet />`. Public route: `/login`. Protected routes (via `ProtectedRoute`): `/` (Home), `/reports` (Reports list), `/reports/:id` (single Report), `/net-worth` (Net Worth list), `/net-worth/:id` (Net Worth snapshot detail)
- GraphQL: Apollo Client 4 configured in `lib/apollo.ts`. Queries/mutations defined per domain in `graphql/health.ts`, `graphql/transactions.ts`, `graphql/reports.ts`, `graphql/netWorth.ts` using `gql` tagged templates. The Apollo client uses a relative `/graphql` URI — Vite proxies this to the backend in dev
- UI components: Reusable primitives in `components/ui/` (Badge, Button, Card, Dropdown, Input, Modal, Select), re-exported from `components/ui/index.ts`
- Charts: Recharts-based components in `components/charts/` — `ExpenseBreakdownChart` (PieChart, used on the Report page) and `IncomeExpensesChart` (grouped BarChart, used on the Home page for the last 12 reports), re-exported from `components/charts/index.ts`. Charts are rendered in collapsible Card sections
- Home page: shows report summary cards (current/previous), a collapsible Net Worth card (latest snapshot with assets/liabilities breakdown, links to `/net-worth/:id`), and the Income & Expenses chart
- Net Worth components: `components/netWorth/` — `NetWorthList` (paginated snapshot list with delete on hover), `CreateNetWorthSnapshotModal` (multi-entry form with live totals and auto-scroll), `DeleteNetWorthSnapshotModal` (confirmation dialog), re-exported from `components/netWorth/index.ts`
- Theming: `contexts/ThemeContext.tsx` provides `useTheme()` hook; toggles dark class on `<html>`, persists to localStorage

**Backend** (Express 5 + Apollo Server 5):

- Entry: `src/index.ts` — Express app with Apollo Server mounted at `/graphql` via `@as-integrations/express5`. Auth middleware protects the GraphQL endpoint
- GraphQL schema: SDL string in `graphql/schema.ts`, resolvers in `graphql/resolvers.ts`, re-exported from `graphql/index.ts`
- Database: PostgreSQL via Prisma 7 with `@prisma/adapter-pg`. Prisma client generated to `src/generated/prisma/`. Connection config uses `PG_*` env vars in `lib/prisma.ts`
- Build: tsup bundles the backend to `dist/` for production (`node dist/index.js`)

**Testing** (Vitest 4):

- Frontend: jsdom environment, setup in `src/test/setup.ts` (includes `@testing-library/jest-dom` matchers and `matchMedia` mock). Custom `MockedProvider` wrapper in `src/test/apollo-test-utils.tsx` for GraphQL mocking
- Backend: node environment, no special setup

## Conventions

- **Commits:** Conventional Commits enforced by commitlint + husky. Format: `type(scope): description`
- **Lint-staged:** On commit, runs ESLint + Prettier on `*.{ts,tsx,js,jsx}` and Prettier on `*.{json,md,css,html}`
- **ESLint:** `id-length` rule requires identifiers of at least 2 characters (exceptions: `_`). Unused vars prefixed with `_` are allowed. `eslint-plugin-simple-import-sort` enforces sorted imports and exports
- **Prettier:** Uses `prettier-plugin-tailwindcss` for class sorting

## Deployment

- **Backend:** Docker → Google Cloud Run (Artifact Registry). Deployed via GitHub Actions on release
- **Frontend:** Built and deployed to Netlify via GitHub Actions on release (auto-publishing disabled in Netlify)
- **CI:** GitHub Actions workflow (`.github/workflows/deploy.yml`) runs test → migrate → deploy-backend → deploy-frontend
