---
name: unit-test
description: Write unit tests for a given file, function, or feature. Follows project testing conventions in .claude/rules/testing.md. Use when the user asks to write, add, or generate tests.
---

Write unit tests for the specified code.

## Rules

All test conventions live in [.claude/rules/testing.md](../../rules/testing.md) —
toolchain, fixtures, mocking, depth per layer, forbidden patterns. Read it first.
The rules below are operational only.

## Steps

1. Read the source file to understand what it does.
2. Read `.claude/rules/testing.md` once if you haven't this session.
3. Check `apps/<app>/src/test/fixtures/<domain>.ts` for an existing factory before
   declaring inline mock data. If none exists for this domain and you need more
   than a trivial object, add the factory there.
4. If a test file already exists, add to it rather than replacing it.
5. Pick the cases from the relevant depth checklist in `testing.md` — stop there
   unless you uncover a real missing branch while writing.
6. Run the tests:
   - Web: `pnpm --filter my-wallet-web exec vitest run <path>`
   - Server: `pnpm --filter my-wallet-server exec vitest run <path>`
7. Fix any failures before reporting done.
