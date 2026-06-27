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
pnpm typecheck            # Type-check all apps
pnpm format               # Format with Prettier

# Run tests for a single app
pnpm --filter my-wallet-web test
pnpm --filter my-wallet-server test

# Run a single test file
pnpm --filter my-wallet-web exec vitest run src/pages/Home.test.tsx
pnpm --filter my-wallet-server exec vitest run src/graphql/reports/resolvers.test.ts

# Prisma (run from apps/server)
pnpm --filter my-wallet-server db:generate         # Generate Prisma client
pnpm --filter my-wallet-server db:migrate          # Run migrations (dev)
pnpm --filter my-wallet-server db:migrate:deploy   # Run migrations (production)
pnpm --filter my-wallet-server db:push             # Push schema without migration
pnpm --filter my-wallet-server db:seed             # Seed the database
pnpm --filter my-wallet-server db:studio           # Open Prisma Studio

# Database bootstrapping (from repo root)
pnpm db:bootstrap         # Bootstrap local database
pnpm db:bootstrap:docker  # Bootstrap database via Docker

# Environment files (GPG-encrypted in repo)
pnpm run env:decrypt      # Decrypt .env files
pnpm run env:encrypt      # Encrypt before committing
```

## Architecture

**Monorepo:** `apps/web` and `apps/server`, managed by pnpm workspaces.

**Web** (React 19 + Vite 8 + Tailwind CSS 4):

- Entry: `main.tsx` → `ThemeProvider` → `PrivacyProvider` → `ToastProvider` → `AuthProvider` → `ApolloProvider` → `UserProvider` → `RouterProvider`
- Routing: React Router 7, `createBrowserRouter` in `router.tsx`. Root layout in `App.tsx` (NavBar + `<Outlet />`). Protected routes via `ProtectedRoute`
- GraphQL: Apollo Client 4 in `lib/apollo.ts`. Queries/mutations per domain in `graphql/`. Uses relative `/graphql` URI — Vite proxies to server in dev
- Auth: `contexts/AuthContext.tsx` (`useAuth`) backed by Supabase Auth. User record in `contexts/UserContext.tsx` (`useUser`), lazily created via upsert on first `me` query
- Privacy: `contexts/PrivacyContext.tsx` (`usePrivacy`) — toggles visibility of money amounts, persisted to localStorage
- Toasts: `contexts/ToastContext.tsx` (`useToast`) — global toast notification system (`showSuccess`, `showError`, `showInfo`)
- UI primitives: `components/ui/` (Badge, Button, Card, Divider, Dropdown, Input, Modal, MoneyAmount, PageLayout, Pagination, SearchInput, Select, Skeleton, Spinner, Toast, Tooltip)
- Feature components: `components/contracts/`, `components/home/`, `components/netWorth/`, `components/reports/`, `components/subscriptions/` — domain-specific composed components. `components/icons/` holds the SVG icon set (barrel-exported from `icons/index.ts`)
- Charts: Recharts in `components/charts/` — `BudgetBreakdownChart`, `ExpenseBreakdownChart`, `IncomeExpensesChart`, `NetWorthCategoryBreakdownChart`, `NetWorthSparkline`, `NetWorthTrendChart`, `SubscriptionCategoryBreakdownChart`
- Types: `types/` — shared TypeScript types per domain (`report.ts`, `subscription.ts`, `contract.ts`, `netWorth.ts`, `transaction.ts`) plus `sort.ts` (shared sort-direction type)
- Utils: `utils/` — pure helpers: `formatMoney`, `formatDate`, `formatDateForInput`, `formatRelativeTime`, `abbreviateReportTitle`, `getInitials`, `getNextRenewalDate`, `getDaysUntil`, `getSubscriptionLogoUrl`, `isSafeUrl`, `exportReportToCsv`, `groupEntriesByCategory`, `isActiveTrial`, `renewalDisplay`, `formatSubscriptionCountdown` (domain-specific draft/input builders like `buildContractInput` live under `hooks/<domain>/selectors/`)

**Server** (Express 5 + Apollo Server 5):

- Entry: `src/index.ts` — Apollo Server mounted at `/graphql` via `@as-integrations/express5`. Auth middleware validates Supabase JWT and extracts `userId` + `email` onto context
- GraphQL schema: SDL strings and resolvers per domain in `graphql/` subdirectories, re-exported from `graphql/index.ts`
- Database: PostgreSQL via Prisma 7 (`@prisma/adapter-pg`). Client generated to `src/generated/prisma/`. Connection built from the typed `env` in `lib/env.ts`
- Config: `lib/env.ts` parses `process.env` against a Zod schema once at boot (fail-fast); `prisma.ts`, `middleware/auth.ts`, and `index.ts` read the typed `env` instead of `process.env`
- Validation: mutation inputs are Zod schemas in `graphql/<domain>/inputSchemas.ts`, parsed via `parseInput` (`lib/validate`); the `zodErrorToGraphQLError` adapter preserves the `BAD_USER_INPUT` contract. Shared field builders in `lib/validate/fields.ts`
- Build: tsup bundles to `dist/` for production

**Testing** (Vitest 4):

- Web: jsdom environment, setup in `src/test/setup.ts` (jest-dom matchers + `matchMedia` mock + module-level Supabase mock). Custom `MockedProvider` in `src/test/apollo-test-utils.tsx` for GraphQL mocking
- Server: node environment, no special setup
- Fixtures: per-domain factory files in `apps/web/src/test/fixtures/` and `apps/server/src/test/fixtures/` (each exports a `make<Domain>(overrides)` function). Web factories return GraphQL response shapes (ISO strings); server factories return Prisma model shapes (`Date` objects). Import via the `fixtures/` barrel rather than declaring inline mock objects.

## GraphQL Domains

Each domain lives in mirrored directories on both sides:

| Domain            | Server                                   | Web graphql                | Web hook                                      | Web page                           |
| ----------------- | ---------------------------------------- | -------------------------- | --------------------------------------------- | ---------------------------------- |
| **reports**       | `apps/server/src/graphql/reports/`       | `graphql/reports.ts`       | `useReportsData` / `useReportData`            | `Reports`, `Report`                |
| **transactions**  | `apps/server/src/graphql/transactions/`  | `graphql/transactions.ts`  | _(used inside report hook)_                   | _(inside Report page)_             |
| **subscriptions** | `apps/server/src/graphql/subscriptions/` | `graphql/subscriptions.ts` | `useSubscriptionsData`                        | `Subscriptions`                    |
| **contracts**     | `apps/server/src/graphql/contracts/`     | `graphql/contracts.ts`     | `useContractsData`                            | `Contracts`                        |
| **netWorth**      | `apps/server/src/graphql/netWorth/`      | `graphql/netWorth.ts`      | `useNetWorthData` / `useNetWorthSnapshotData` | `NetWorth`, `NetWorthSnapshotPage` |
| **user**          | `apps/server/src/graphql/user/`          | `graphql/user.ts`          | `useProfileData`                              | `Profile`                          |

`Home` page (`hooks/home/useHomeData.ts`) is a dashboard that aggregates across reports, netWorth, subscriptions, and contracts (an "expiring soon" card) — it has no dedicated server domain.
`NotFound` is a standalone 404 page with no data dependencies.

**Server domain structure**:

- `schema.ts` — SDL exported as `<domain>TypeDefs`
- `inputSchemas.ts` — Zod mutation input schemas with types derived via `z.infer`
- `resolvers.ts` — resolvers exported as `<domain>Resolvers`; mutation resolvers call `parseInput(schema, input)`
- `resolvers.test.ts` — Vitest unit tests, prisma mocked via `vi.mock`
- `lib/<helper>.ts` (optional) — pure, reusable helpers > 10 LOC or with branchy logic worth testing on their own (e.g. `subscriptions/lib/computeMonthlyCost.ts`); each helper has its own `.test.ts` next to it

All domains are merged in `apps/server/src/graphql/index.ts`.

**Web data hook pattern:** hooks own all query/mutation logic and return a flat object of state + `on<Action>` handlers. Pages are thin — they just destructure the hook and render.

**Subscription cancellation model:** `cancelledAt` marks when cancelled, `endDate` is the last active date (set to next renewal on cancellation). `isActive` is a computed field — it checks `cancelledAt` + `endDate` rather than the stored `isActive` column when a subscription has been cancelled.

**Contracts model:** tracks real-world service contracts (provider, plan, category, optional cost) and, above all, their `endDate`. `category` is stored as a free-text string (curated `<Select>` with an "Other → free-text" fallback), deliberately not an enum — a future user-defined-options system across domains will migrate it. `isExpired` is a computed server field (`endDate < now`); the "expiring soon" window (30 days) is a web-side concern in `hooks/contracts/selectors/computeExpiringSoon.ts`. Plain CRUD only (no cancel/resume), single list sorted by `END_DATE`.

## Releases

The monorepo carries a single version across all three `package.json` files (root, `apps/web`, `apps/server`), kept in lockstep. Releases are tagged `v<version>` (e.g. `v0.6.0`).

- **Version display:** `apps/web/package.json`'s `version` is injected at build time by Vite as the `__APP_VERSION__` global (see `vite.config.ts`), surfaced through `utils/appVersion.ts` (`APP_VERSION`). Shown in the NavBar user dropdown footer and on the Profile page. The browser bundle can't read `package.json` at runtime — always go through `APP_VERSION`, never re-read the file.
- **What's New:** user-facing release notes live in `apps/web/src/content/whatsNew.ts` — a hand-curated `Array<WhatsNewRelease>`, newest first. The NavBar dropdown's "What's New" item opens `WhatsNewModal`, which renders only `whatsNew[0]` (the current release); older entries are retained history. `highlights` are features; the optional `improvements` bucket carries notable fixes so a pure-patch release is never empty. Copy is curated, not raw commit text.
- **Cutting a release:** run the `/release` skill. It reads commits since the last tag, decides the bump type from Conventional Commits, drafts the `whatsNew.ts` entry for your review, then (on approval) prepends the entry and bumps all three `package.json` versions. It never commits or tags — it hands you those commands. Tag + commit before preparing the next release, since the tag is the boundary `/release` reads from.
