# Review the current branch against main, focusing on this project's specific conventions and patterns

## What to check

### Naming conventions

- No abbreviations anywhere: `transaction` not `tx`, `subscription` not `sub`, `event` not `e`, `error` not `err`, `reference` not `ref`, `parameter` not `param`, `index` not `idx`
- All identifiers must be ≥ 2 characters (except `_` for ignored destructure/params)
- Variable names should read as plain English description of what they hold

### Code style

- Destructure keys must be alphabetically sorted: `{ alpha, beta, gamma }` ✓ / `{ beta, alpha }` ✗
- Imports must be sorted (enforced by `eslint-plugin-simple-import-sort`)
- No `console.log`, `console.warn`, `console.error` left in
- No commented-out code blocks

### GraphQL / Server patterns

- Every resolver that reads or writes data filters by `userId` from context — never expose another user's data
- Mutations must do a `findFirst({ where: { id, userId } })` ownership check before updating or deleting
- Missing resources throw `GraphQLError` with `extensions: { code: 'NOT_FOUND' }`
- Permission violations throw `GraphQLError` with `extensions: { code: 'FORBIDDEN' }`
- New types/mutations registered in `apps/server/src/graphql/index.ts`

### Testing

- New resolvers have tests in `resolvers.test.ts` covering: happy path, not-found branch, any permission/lock checks
- New web components/pages have tests covering: loading state, error state, populated state
- Tests use `vi.mock` for prisma (server) or `MockedProvider` (web) — no real DB or network calls
- No skipped tests (`it.skip`, `describe.skip`, `xit`)

### Web patterns

- New pages use `PageLayout` as the root wrapper
- Data fetching is in a `use<Domain>Data` hook, not inline in the page component
- Modals accept `isOpen`, `onClose`, and an `onSubmit`/`on<Action>` callback — they don't own their open state
- Toast feedback via `useToast()` on mutation success and failure

### Prisma / DB

- New migrations have a descriptive name matching the change (e.g. `add_cancelled_at_to_subscriptions`)
- Schema changes include the generated Prisma client (`db:generate` was run)
- No raw SQL queries when the Prisma client API covers it

### Commit hygiene

- Commit messages follow Conventional Commits: `type(scope): description`
- Valid types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`, `perf`
- No merge commits in the branch (should be rebased on main)

## Output format

For each issue found, state:

1. The file and line number
2. What the problem is
3. What the fix should be

If everything looks good in a category, say so explicitly. End with an overall verdict: **Approve**, **Approve with minor nits**, or **Request changes**.
