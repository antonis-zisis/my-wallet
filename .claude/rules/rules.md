---
description: General codebase rules to follow when writing any code in this project. A holding area - each section graduates into its own `rules/*.md` file as it grows.
---

Rules are phrased as **trigger → action**: when the trigger applies, do the action.

## Workflow

- **Finished a change → don't commit unless the user explicitly asks.** Staging and committing are the user's call, not yours.

## Conventions

- **Defining a TypeScript type → use `type`, never `interface`. Use `&` intersection instead of `extends`.** The only exception is declaration merging / module augmentation of an external or global type, which requires `interface` and an inline `// eslint-disable-next-line @typescript-eslint/consistent-type-definitions` explaining why. Enforced by ESLint's `@typescript-eslint/consistent-type-definitions` and auto-fixed by `pnpm lint --fix`.
- **Naming an identifier → spell it out in full; never abbreviate.** `transaction` not `tx`, `subscription` not `sub`, `event` not `e`, `error` not `err`, `reference` not `ref`, `parameter` not `param`, `index` not `idx`. A name should read as a plain-English description of what it holds. ESLint enforces a 2-character floor, but it can't catch a short-but-real abbreviation like `tx` — that's on you.
- **Writing a commit message → use Conventional Commits: `type(scope): description`.** Valid types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`, `perf`. Enforced by commitlint + husky.
- **Function signature contains an inline object type → extract it to a named `type` above the function.** A signature like `foo(input: { a: string; b: number }): R` is harder to read than `type FooInput = { ... }; function foo(input: FooInput): R`. Especially extract when the inline shape wraps across multiple lines. Trivia on one line under ~30 characters (e.g. `{ children: ReactNode }`) is exempt. When naming the extracted type, don't shadow domain types — if a function takes a subset of `Subscription`, the local type should describe the function's role (`IsActiveTrialInput`, `Trialable`), not reuse the domain name.
- **Code formatting → blank line after a control-flow block (`if`, `else`, `for`, `while`, `switch`, `try`) and before any `return` that has statements above it in the same block.** Enforced automatically by ESLint's `padding-line-between-statements` and auto-fixed by `pnpm lint --fix`. Makes block boundaries and the function's "result" visually obvious.

## Design

- **Setting a border radius → use the `rounded` token (4px).** Don't introduce other radius scales (`rounded-md`, `rounded-lg`, `rounded-[6px]`). The project deliberately uses a single corner radius.
- **Need a fully circular element (avatar, pill, icon button, spinner) → use `rounded-full`.** This is the only allowed exception to the 4px rule.
