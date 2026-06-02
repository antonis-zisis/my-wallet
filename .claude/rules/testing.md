This rule defines how tests are written so they document behaviour, survive refactors, and don't sprawl. Rules are phrased as **trigger → action**: when the trigger applies, do the action.

Sibling rules: [architecture.md](./architecture.md) for code layout, [rules.md](./rules.md) for naming/workflow, [security.md](./security.md) for auth-sensitive code.

The single guiding principle: **test what the user — human or caller — observes.** Internal state, call counts, and CSS classes are not user-observable.

## Toolchain

- **Web** (`apps/web`): Vitest 4, jsdom environment, setup in `src/test/setup.ts` (jest-dom matchers + `matchMedia` mock). GraphQL components use `MockedProvider` from `src/test/apollo-test-utils.tsx`.
- **Server** (`apps/server`): Vitest 4, node environment. Prisma is mocked via `vi.mock('../../lib/prisma')`.

Run a single file:

- `pnpm --filter my-wallet-web exec vitest run <path>`
- `pnpm --filter my-wallet-server exec vitest run <path>`

## File layout

- **Writing a test → it lives next to the source file.** `Foo.tsx` → `Foo.test.tsx`. `validateAmount.ts` → `validateAmount.test.ts`. Never under a separate `__tests__/` tree.
- **Adding a fixture → it lives in** `apps/<app>/src/test/fixtures/<domain>.ts` **and exports a factory function** (`makeSubscription`, `makeReport`, `makeTransaction`) that takes a `Partial<T>` of overrides. Test files import the factory rather than declaring inline `mock<Domain>` objects.

## Structure

- **Writing a test file → one top-level `describe` per public function, hook, or component.** Group related cases with nested `describe` blocks for branches (`describe('when unauthenticated', ...)`, `describe('when the report is locked', ...)`).
- **Inside an `it` → use AAA, visually separated by a single blank line.** Arrange, Act, Assert. If a test has no Arrange or no Act, that's fine; the blank line separator still applies between the parts that exist.
- **`it` name describes user-observable behaviour, not implementation.** Good: `'shows an error toast when create fails'`. Bad: `'calls showError with the correct message'`.
- **No test depends on the order tests run in.** State that needs resetting goes in `beforeEach`, never module scope.

## Mocking

- **Mocking `useToast` (or any context-providing hook) → reset per test.**

  Don't do this — the mock is shared across every test in the file and call history leaks:

  ```ts
  vi.mock('../contexts/ToastContext', () => ({
    useToast: vi.fn().mockReturnValue({
      showSuccess: vi.fn(),
      showError: vi.fn(),
    }),
  }));
  ```

  Do this:

  ```ts
  const showSuccess = vi.fn();
  const showError = vi.fn();
  vi.mock('../contexts/ToastContext', () => ({
    useToast: () => ({ showSuccess, showError }),
  }));

  beforeEach(() => {
    showSuccess.mockReset();
    showError.mockReset();
  });
  ```

- **Mocking the database → never.** On the server, mock the Prisma client at the module boundary (`vi.mock('../../lib/prisma')`). On the web, mock the GraphQL response via `MockedProvider`. No hand-rolled Prisma stubs and no `fetch` mocks in tests.

- **Mocking a module the test isn't really about → reconsider.** If you find yourself mocking 4+ modules to test one thing, the unit-under-test is doing too much and the architecture rules (selectors, smaller hooks) should apply.

## Depth — what to actually test

A short, readable test file that documents intent beats a brittle one chasing 100% coverage. Pick the cases below per layer; stop there unless a real bug surfaces a missing case.

### Pure utility (`utils/`, `lib/`)

- Happy path with one representative input.
- Each branch the function actually takes.
- One edge case that has historically broken it (empty array, null, leap year, etc.) — only if real.

### Server resolver

- Happy path.
- Not-found branch (record exists for a different `userId`, or doesn't exist at all).
- Permission / lock branch where present.
- One representative validation failure (don't enumerate every validator — those are tested where the validator lives).

### Web data hook

- Loading state.
- Error state.
- Populated state — one assertion that the returned data is what callers will render.
- One mutation success path showing the toast and the state change.
- One mutation failure path showing the error toast.

That's it. Don't re-test query variables, refetch keys, or every handler; the hook's job is to wire things together and one success + one failure prove the wiring works.

### Web component / page

- Renders each visible state the user can land on (loading, error, empty, populated).
- Fires one key interaction and asserts the resulting visible change.
- For pages: assert that the right hook results render, not that the hook was called.

### Web context

- Provider renders children.
- The hook surfaces the provider's value.
- One mutation through the hook (e.g. `showSuccess` appends a toast).

## Assertions — what to use

- **Asserting on rendered text → `screen.getByText`, `getByRole`, `getByLabelText`.** Prefer role + name where possible — closer to what a screen reader sees.
- **Asserting on a value the hook returned → assert on the value directly.** Don't go through the DOM if the hook is the unit under test.
- **Asserting on a CSS class → don't.** Especially never assert on colour classes. They're styling, not behaviour, and break on every restyle. The exception is a class that is a documented public API of a UI primitive (rare; flag it in review).
- **Asserting on call counts of internal helpers → don't.** The helper has its own test. Asserting the parent called it isn't behaviour — it's plumbing.

## Forbidden

- `it.skip`, `describe.skip`, `xit` — if a test is broken, fix it or delete it.
- `setTimeout` / `setInterval` real-time waits — use `waitFor` or fake timers.
- Inline fixtures when a `test/fixtures/<domain>.ts` factory exists for that type.
- Tests that exceed **2× the source file's length**. If you're past that, you're either testing implementation details or the source file is doing too much (apply `architecture.md`).

## When this rule conflicts with the task

If the cleanest test for a change would require introducing a new mocking pattern or breaking one of the rules above, call it out in the response and propose the rule update at the same time. Don't quietly diverge.
