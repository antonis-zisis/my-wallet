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
- Routing: React Router 8 — `react-router-dom` is gone; `createBrowserRouter` and route components come from `react-router`, `RouterProvider` comes from `react-router/dom` (used in `main.tsx`). `createBrowserRouter` call lives in `router.tsx`. Root layout in `App.tsx` (NavBar + `<Outlet />`). Protected routes via `ProtectedRoute`
- GraphQL: Apollo Client 4 in `lib/apollo.ts`. Queries/mutations per domain in `graphql/` (reports is split into `graphql/reports/{queries,mutations,index}.ts`). Uses relative `/graphql` URI — Vite proxies to server in dev
- Auth: `contexts/AuthContext.tsx` (`useAuth`) backed by Supabase Auth. User record in `contexts/UserContext.tsx` (`useUser`), lazily created via upsert on first `me` query
- Privacy: `contexts/PrivacyContext.tsx` (`usePrivacy`) — toggles visibility of money amounts, persisted to localStorage
- Toasts: `contexts/ToastContext.tsx` (`useToast`) — global toast notification system (`showSuccess`, `showError`, `showInfo`)
- UI primitives: `components/ui/` (Avatar/AvatarGroup, Badge, Button, Card, Divider, Dropdown, Input, Modal, MoneyAmount, PageLayout, Pagination, SearchInput, Select, Skeleton, Spinner, Toast, Tooltip)
- Feature components: `components/contracts/`, `components/home/`, `components/navbar/`, `components/netWorth/`, `components/reports/`, `components/subscriptions/` — domain-specific composed components. `components/icons/` holds the SVG icon set (barrel-exported from `icons/index.ts`)
- Charts: Recharts in `components/charts/` — `BudgetBreakdownChart`, `CategoryTrendChart`, `CategoryTrendTile`, `ExpenseBreakdownChart`, `IncomeExpensesChart`, `NetWorthCategoryBreakdownChart`, `NetWorthSparkline`, `NetWorthTrendChart`, `SubscriptionCategoryBreakdownChart`. The two donut charts share `makeBreakdownPieShape` for their active-sector renderer
- Types: `types/` — shared TypeScript types per domain (`report.ts`, `subscription.ts`, `contract.ts`, `netWorth.ts`, `transaction.ts`) plus `sort.ts` (shared sort-direction type)
- Utils: `utils/` — pure helpers: `formatMoney`, `formatDate`, `formatDateForInput`, `formatMonth`, `formatRelativeTime`, `abbreviateReportTitle`, `getInitials`, `getNextRenewalDate`, `getDaysUntil`, `getSubscriptionLogoUrl`, `isSafeUrl`, `exportReportToCsv`, `groupEntriesByCategory`, `isActiveTrial`, `renewalDisplay`, `formatSubscriptionCountdown` (domain-specific draft/input builders like `buildContractInput` live under `hooks/<domain>/selectors/`)
- Responsive: the app is built mobile-first from a single breakpoint — Tailwind's `md` (768px). Most layouts flip with `sm:`/`md:` classes; where the two layouts differ structurally rather than cosmetically (`TransactionTable`, `NetWorthListRow`, `SubscriptionListRow`, the donut charts) the component branches on `useIsMobileViewport()` so only one layout is in the DOM. `hooks/useMediaQuery.ts` is the generic primitive; `hooks/useIsMobileViewport.ts` pins the breakpoint so it can't drift from the `md:` classes. Tests drive both branches with `installMatchMedia` from `test/matchMedia-test-utils.ts`.
- The NavBar collapses to a hamburger drawer below `md` (`components/navbar/NavBarMobileMenu.tsx`); the drawer's links are only mounted while it is open.

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
| **reports**       | `apps/server/src/graphql/reports/`       | `graphql/reports/`         | `useReportsData` / `useReportData`            | `Reports`, `Report`                |
| **transactions**  | `apps/server/src/graphql/transactions/`  | `graphql/transactions.ts`  | `useCategoryTrendsData` _(+ report hook)_     | `CategoryTrends`, inside `Report`  |
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

**Report sharing model:** a report can be shared with other registered users (looked up by lowercase-normalized email; the target `users` row must exist). The owner is implicit (`Report.userId`, Supabase id) — `ReportShare` rows carry `VIEWER` or `EDITOR` roles (`SHARE_ROLES` in `lib/validate/enums.ts`). One access predicate (`reportAccessWhere` in `reports/lib/reportAccess.ts`, owner OR shared) drives the `reports`/`report`/`transactions` queries; `resolveReportAccess` gates mutations (`NOT_FOUND` for strangers, `FORBIDDEN` for insufficient role). Editors add/edit/delete transactions and rename; share/unshare/role-change/lock/delete are owner-only; members leave via `leaveSharedReport`. `Report.members`/`myRole` are field resolvers (batch-preloaded for the list query); `Transaction.createdById` attributes authorship (null = owner). Web side: `useReportSharing` (composed by both report hooks), `ShareReportModal`, `Avatar`/`AvatarGroup` member indicators, and `myRole`-gated affordances on the Report page. The reports server resolvers are split into `queries.ts`/`mutations.ts`/`fields.ts`, merged in `resolvers.ts`.

**Subscription cancellation model:** `cancelledAt` marks when cancelled, `endDate` is the last active date (set to next renewal on cancellation). `isActive` is a computed field — it checks `cancelledAt` + `endDate` rather than the stored `isActive` column when a subscription has been cancelled.

**Category trends model:** `CategoryTrends` (`pages/CategoryTrends.tsx`, routed at `/reports/trends` and reached from a link on the `Reports` page) charts expense spending per calendar month, bucketed by `Transaction.date` rather than by report — a report is a titled bucket, not a month, so report-bucketing breaks on a `"Q1 2026"` or cross-month report. It lives on its own route rather than on the reports list because it is decoupled from that page's search/sort/pagination and needs room for its own controls. `expenseCategoryTotalsByMonth` (transactions domain) aggregates server-side into `{ category, month, total }` rows scoped by `reportAccessWhere`, so reports shared with you are included, matching Home's Monthly Summary. The web always requests the maximum 12-month window and applies the user's 3/6/9/12 selection client-side in `hooks/transactions/selectors/buildCategoryTrends.ts`, which zero-fills empty months, clamps the axis left edge to the first month with data, and orders categories by `EXPENSE_CATEGORIES` index with unknown free-text categories appended. The page shows a two-column grid of `CategoryTrendTile` sparklines (one per category, each zero-anchored to its own max — magnitude is carried by the printed total, not the axis); clicking one swaps the grid for `CategoryTrendDetail`, a full-size monthly bar chart (bars because monthly sums are discrete flow, matching `IncomeExpensesChart`). The headline number is the **current month-to-date** with a delta against the **previous full month**, so the badge reads low early in a month; the `Aug so far vs Jul` scope line is what keeps that honest and is not optional. Below two distinct months of expense history the page renders an empty state instead of the grid.

**Contracts model:** tracks real-world service contracts (provider, plan, category, optional cost) and, above all, their `endDate`. `category` is stored as a free-text string (curated `<Select>` with an "Other → free-text" fallback), deliberately not an enum — a future user-defined-options system across domains will migrate it. `isExpired` is a computed server field (`endDate < now`); the "expiring soon" window (90 days) is a web-side concern in `hooks/contracts/selectors/computeExpiringSoon.ts`. Plain CRUD only (no cancel/resume), single list sorted by `END_DATE`.

## Releases

The monorepo carries a single version across all three `package.json` files (root, `apps/web`, `apps/server`), kept in lockstep. Releases are tagged `v<version>` (e.g. `v0.6.0`).

- **Version display:** `apps/web/package.json`'s `version` is injected at build time by Vite as the `__APP_VERSION__` global (see `vite.config.ts`), surfaced through `utils/appVersion.ts` (`APP_VERSION`). Shown in the NavBar user dropdown footer and on the Profile page. The browser bundle can't read `package.json` at runtime — always go through `APP_VERSION`, never re-read the file.
- **What's New:** user-facing release notes live in `apps/web/src/content/whatsNew.ts` — a hand-curated `Array<WhatsNewRelease>`, newest first. The NavBar dropdown's "What's New" item opens `WhatsNewModal`, which renders only `whatsNew[0]` (the current release); older entries are retained history. `highlights` are features; the optional `improvements` bucket carries notable fixes so a pure-patch release is never empty. Copy is curated, not raw commit text.
- **Cutting a release:** run the `/release` skill. It reads commits since the last tag, decides the bump type from Conventional Commits, drafts the `whatsNew.ts` entry for your review, then (on approval) prepends the entry and bumps all three `package.json` versions. It never commits or tags — it hands you those commands. Tag + commit before preparing the next release, since the tag is the boundary `/release` reads from.
