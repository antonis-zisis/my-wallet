# Implement a new feature in this project: $ARGUMENTS

Follow the exact patterns already established in the codebase. Work through each layer in order:

## 0. Create a branch

```bash
git checkout -b feat/<short-description>
```

## 1. Prisma schema (if the feature requires a DB change)

Edit `apps/server/prisma/schema.prisma`. Then run:

```bash
pnpm --filter my-wallet-server db:migrate
pnpm --filter my-wallet-server db:generate
```

Name the migration in snake_case describing the change:

- `add_<field>_to_<model>` — new field
- `add_<model>` — new model
- `remove_<field>_from_<model>` — removed field

## 2. Server — GraphQL schema

Create or update `apps/server/src/graphql/<domain>/schema.ts`.

- Export a single `const <domain>TypeDefs` template literal tagged with `` `#graphql` ``
- Use `extend type Query` / `extend type Mutation` (never redefine the base types)
- Define input types for mutations (e.g. `CreateXInput`, `UpdateXInput`)
- For list queries, return a `<Domain>sResult { items: [<Domain>!]! totalCount: Int! }` type

Register the new typeDefs in `apps/server/src/graphql/index.ts`.

## 3. Server — Resolvers

Create or update `apps/server/src/graphql/<domain>/resolvers.ts`.

- Export TypeScript interfaces for each input type at the top of the file
- Export a `const <domain>Resolvers` object
- Every resolver that touches data must accept `{ userId }: { userId: string }` as the third context argument and filter by `userId`
- Use `prisma.findFirst({ where: { id, userId } })` before mutating — throw `GraphQLError` with `extensions: { code: 'NOT_FOUND' }` if missing
- Use `GraphQLError` with `extensions: { code: 'FORBIDDEN' }` for permission violations
- Spread the new resolvers into the merged object in `apps/server/src/graphql/index.ts`

## 4. Server — Tests

Create or update `apps/server/src/graphql/<domain>/resolvers.test.ts`.

- Mock prisma: `vi.mock('../../lib/prisma', () => ({ default: { <model>: { findMany: vi.fn(), ... } } }))`
- Import the mock after `beforeEach` with `vi.clearAllMocks()`: `prisma = (await import('../../lib/prisma')).default`
- Use `const CTX = { userId: 'user-1' }` as the shared context fixture
- Write one `describe` block per resolver, testing the happy path and each error branch

## 5. Web — GraphQL operations

Create or update `apps/web/src/graphql/<domain>.ts`.

- Import `{ gql } from '@apollo/client'`
- Export one `const` per operation: `GET_<THINGS>`, `CREATE_<THING>`, `UPDATE_<THING>`, `DELETE_<THING>`, etc.
- Field selections must be alphabetically sorted within each selection set

## 6. Web — Data hook

Create `apps/web/src/hooks/use<Domain>Data.ts` (or `use<Domain>Data.tsx` if JSX is needed).

- Use `useQuery` / `useMutation` from `@apollo/client/react`
- Use `useToast()` from `../contexts/ToastContext` for `showSuccess` / `showError` feedback
- Return a flat object with all state and handlers named `on<Action>` (e.g. `onCreateReport`, `onOpenModal`)
- Export a `PAGE_SIZE` constant if the query is paginated

## 7. Web — Page component

Create `apps/web/src/pages/<Domain>.tsx`.

- Import data from the hook, render state from it
- Handle `loading`, `error`, and empty states
- Use `PageLayout` from `../components/ui` as the root wrapper

Register the new route in `apps/web/src/router.tsx`.

## 8. Web — Components

Create focused components in `apps/web/src/components/<domain>/`.

- One component per file, named and exported as a named export
- Use UI primitives from `../components/ui` (Button, Card, Modal, Badge, Input, Select, Spinner, Skeleton, etc.)
- Modal components follow the pattern: accept `isOpen`, `onClose`, and an `onSubmit` callback prop

## 9. Web — Tests

Write tests for:

- The data hook (`use<Domain>Data.test.ts` or `.tsx`)
- Key components (modals, lists) using `MockedProvider` from `../../test/apollo-test-utils`
- The page itself for loading / error / populated states

## 10. Run tests

```bash
pnpm --filter my-wallet-server test   # for server changes
pnpm --filter my-wallet-web test      # for web changes
pnpm test                             # for both
```

## 11. Typecheck

```bash
pnpm typecheck
```

## 12. Lint

```bash
pnpm lint
```

## 13. UI verification (web changes only)

Start the dev server and exercise the feature in a browser:

```bash
pnpm dev:web
```

Test the golden path and edge cases. Check for regressions in nearby features.

## 14. Summarise

Describe what was added and why. When the user asks to commit, use Conventional Commits: `feat(<scope>): description`. Do not commit or open a PR unless explicitly asked.

## Conventions to enforce throughout

- **No abbreviations**: `transaction` not `tx`, `subscription` not `sub`, `event` not `e`, `error` not `err`
- **Sorted destructure keys**: `{ alpha, beta, gamma }` — alphabetical order always
- **Sorted imports**: `eslint-plugin-simple-import-sort` enforces this — don't fight it
- **Identifiers ≥ 2 characters** except `_` for ignored params (ESLint `id-length` rule)
