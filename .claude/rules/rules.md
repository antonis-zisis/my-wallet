---
description: General codebase rules to follow when writing any code in this project. A holding area - each section graduates into its own `rules/*.md` file as it grows.
---

Rules are phrased as **trigger → action**: when the trigger applies, do the action.

## Workflow

- **Finished a change → don't commit unless the user explicitly asks.** Staging and committing are the user's call, not yours.

## Conventions

- **Naming an identifier → spell it out in full; never abbreviate.** `transaction` not `tx`, `subscription` not `sub`, `event` not `e`, `error` not `err`, `reference` not `ref`, `parameter` not `param`, `index` not `idx`. A name should read as a plain-English description of what it holds. ESLint enforces a 2-character floor, but it can't catch a short-but-real abbreviation like `tx` — that's on you.
- **Writing a commit message → use Conventional Commits: `type(scope): description`.** Valid types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`, `perf`. Enforced by commitlint + husky.

## Design

- **Setting a border radius → use the `rounded` token (4px).** Don't introduce other radius scales (`rounded-md`, `rounded-lg`, `rounded-[6px]`). The project deliberately uses a single corner radius.
- **Need a fully circular element (avatar, pill, icon button, spinner) → use `rounded-full`.** This is the only allowed exception to the 4px rule.
