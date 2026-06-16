This rule defines how code is organised across both apps so the project stays readable as it grows. Rules are phrased as **trigger → action**: when the trigger applies, do the action.

Sibling rules: [rules.md](./rules.md) for naming/workflow/design, [security.md](./security.md) for auth and input handling, [testing.md](./testing.md) for tests.

## File responsibility (both apps)

- **Creating a new file → it must have one clear responsibility.** A file's exports should belong together because they are the same thing or two halves of one thing, not because they happen to be in the same domain.

  Allowed groupings:
  - A React Context Provider + its `useX` hook + the context's `Value` interface.
  - A hook + the TypeScript interfaces describing its arguments / return value.
  - A small family of related constants used together (e.g. `EXPENSE_CATEGORY_COLORS` + `ASSET_CATEGORY_COLORS` in `categoryColors.ts`).
  - A component + small subcomponents that are only rendered by it and would be pointless to import elsewhere.

  Forbidden groupings:
  - Data fetching + presentational JSX in the same file.
  - Domain helper functions co-resident with the resolver / hook / component that calls them when the helper is reusable, > ~10 LOC, or has its own branchy logic worth testing.
  - Two unrelated utilities just because they share a vague theme.

- **File exceeds 250 LOC → propose a split before adding more.** Treat this as a soft ceiling; report it in the response and either split now or justify why not. Generated files (`apps/server/src/generated/**`) are exempt.

- **Module-level mutable state (`let x = 0`, mutating top-level objects) → don't.** Leaks across instances and across tests. Use `useState`, `useRef`, `useId`, or a stable id generator passed in via props.

## Naming

- **File name must match its primary export.** `useReportData.ts` exports `useReportData`. `TransactionTable.tsx` exports `TransactionTable`. `validateAmount.ts` exports `validateAmount`. A barrel `index.ts` re-exports only.
- **Directory name singular** for a domain (`reports/`, `subscriptions/`, not `report/`).

## Web — hooks

- **Adding a `use<Domain>Data` hook → it owns Apollo queries, mutations, and the action handlers that wire mutations to mutations.** It does not own derived analytics or modal UI state when either of those grows beyond trivial.

- **Computing derived data from query results → extract a pure selector** to `apps/web/src/hooks/<domain>/selectors/<name>.ts` and test it directly with plain inputs. The hook calls the selector.

  Trigger: the derivation is more than a one-liner, branches on multiple fields, or is unit-testable without React. Example: `renewingThisMonthTotal` in `useSubscriptionsData` — branchy per billing cycle, deserves its own file and test.

- **Modal flags + their setters > 3 in one hook → extract `use<Domain>Modals`** to `apps/web/src/hooks/<domain>/use<Domain>Modals.ts` — it owns just the open/close state and the "select X for action" setters. The data hook composes it. Example: `subscriptions/useSubscriptionsModals.ts`, `reports/useReportModals.ts`.

- **A `use<Domain>Data` hook exceeds 200 LOC → split it.** Candidate splits, in this order: selectors out, modal state out, mutation handlers into their own `use<Domain>Mutations` at `apps/web/src/hooks/<domain>/use<Domain>Mutations.ts`. The mutations hook owns the `useMutation` calls and their `on<Action>` handlers; the data hook passes in the query variables, the modals object, and any state setters the handlers need, then composes the result. Example: `subscriptions/useSubscriptionsMutations.ts`, extracted from `useSubscriptionsData`.

- **Every domain hook lives under `apps/web/src/hooks/<domain>/`** — the primary `use<Domain>Data` hook and everything it composes (`use<Domain>Modals`, `use<Domain>Mutations`, form hooks like `useSubscriptionForm`, and pure unit-tested helpers under `apps/web/src/hooks/<domain>/selectors/` — query-derived selectors and form/draft factories alike). This mirrors `components/<domain>/` and `pages/` reaching into `<domain>/`: one `<layer>/<domain>/` model across the app. There is no flat-at-`hooks/` placement for domain hooks. A domain folder may hold a single file (e.g. `hooks/user/useProfileData.ts`) — that's fine; the folder still earns its place by keeping the domain's hooks together.

- **A hook tightly coupled to one component still belongs in `hooks/<domain>/`, not beside the component.** A form hook (`useSubscriptionForm`) consumed only by that domain's modals lives in `hooks/<domain>/`, and the component imports it. Hooks do not live under `components/`.

- **Only genuinely generic, cross-domain hooks stay flat at `apps/web/src/hooks/`** (e.g. `useLocalStorage`, consumed by several domains and tied to none). A hook shared by multiple pages within one domain stays in that `<domain>/` folder; document the callers in the file header.

## Web — components

- **Writing a component → it's a function component with a named export, one per file.** No class components. No default exports. The filename matches the PascalCase component name (`TodoItems.tsx` exports `TodoItems`). The single-component-per-file rule has one exception: small subcomponents only rendered by the file's primary component and pointless to import elsewhere may share the file.

- **Building a component → keep it presentational where possible.** Push data fetching, mutations, and derived state into a `use<Domain>Data` hook or a selector; the component takes props and renders. Data fetching and presentational JSX never share a file.

- **State growing inside a component → lift it up, then extract a hook.** Start with local `useState`; when state needs to be shared, coordinated, or tested without React, lift it to the nearest common parent and — once it has real logic — extract it into a custom hook. (The `useState > 4 in one component` ceiling below is the hard backstop, not the first signal.)

- **Component file exceeds 200 LOC → split into subcomponents** in the same domain folder. Each subcomponent gets its own file unless it's a 3-line presentational piece that's only rendered by its parent.

- **Helper function inside a `.tsx` file → fine only if it's < 5 LOC and not exported.** Anything bigger or reused moves to:
  - `apps/web/src/utils/<name>.ts` — always, even when the helper only has one caller today.

- **Inline `useState` count > 4 in one component → reconsider.** Either lift to a hook, or use a single `useReducer` for the workflow state, or split the component.

- **Modal component pattern:** props are `isOpen`, `onClose`, and `on<Action>` callbacks. The modal does not own its open state. The parent hook does.

- **Money displayed in JSX → use `<MoneyAmount />`.** Never format with `formatMoney` inline — that bypasses privacy mode.

## Web — GraphQL operation files

- **`graphql/<domain>.ts` exceeds ~150 LOC → split into `graphql/<domain>/queries.ts` and `graphql/<domain>/mutations.ts`,** re-exported from `graphql/<domain>/index.ts`. Keep field selections alphabetically sorted within each selection set.

- **Adding a new operation → its variables shape matches the resolver's input shape.** If they diverge you have a translation layer hiding somewhere — find it and remove it.

## Server — resolvers

- **Helper used by more than one resolver, or > 10 LOC, or has branchy logic worth testing → extract to** `apps/server/src/graphql/<domain>/lib/<name>.ts` with its own test. The resolver imports it.

  Example: `computeMonthlyCost` in `subscriptions/resolvers.ts` — used by the field resolver and by the sort path, branches on billing cycle. Belongs in `lib/computeMonthlyCost.ts`.

- **`resolvers.ts` exceeds ~300 LOC → split into `queries.ts` / `mutations.ts` / `fields.ts`** and re-export the merged resolver map from `resolvers.ts`. The merged shape stays the same so `graphql/index.ts` doesn't change.

- **Resolver argument shape → declare the TypeScript interface at the top of the file** (current pattern). Don't inline `{ input }: { input: { ... } }` in the signature when the input has more than two fields.

- **Throwing in a resolver → `GraphQLError` with `extensions.code`.** `NOT_FOUND` for missing-or-not-yours, `FORBIDDEN` for permission, `BAD_USER_INPUT` for validation. The message is safe to show the user; internal detail goes in `extensions` or the log.

## Server — validation

- **Reusable validator → lives in** `apps/server/src/lib/validate/<name>.ts` **and is re-exported from `validate/index.ts`.** Enum constants (`BILLING_CYCLES`, `TRANSACTION_TYPES`, etc.) live with the validator that uses them, or in `validate/enums.ts` if they're shared by multiple validators.

- **Validating ad-hoc inside a resolver → don't.** If the check is reusable, add it to `validate/`. If it's genuinely one-off, document why in a comment.

## Server — domain structure

A server domain has this layout:

```
apps/server/src/graphql/<domain>/
  schema.ts              # SDL exported as <domain>TypeDefs
  resolvers.ts           # merged resolver map
  resolvers.test.ts      # tests
  lib/<helper>.ts        # pure helpers, one per file
  lib/<helper>.test.ts
```

`graphql/index.ts` continues to merge all domain typeDefs + resolvers.

## When this rule conflicts with the task

If splitting a file mid-task would explode the diff or break unrelated tests, note it in the response and either (a) finish the task in the current file and open a follow-up to split, or (b) do the split as a prefactor commit first. Don't silently ship a 600-line file with a TODO. The user can grant an exception; you cannot grant one to yourself.
