---
name: gh-issue
description: Work a GitHub issue end-to-end — fetch, branch, implement, test. Handles bugs, features, chores. Invoke with /gh-issue <number>.
disable-model-invocation: true
argument-hint: <issue-number>
---

## Steps

1. Fetch the issue:

   ```bash
   gh issue view $ARGUMENTS
   ```

   Read the title, description, comments, and any linked PRs to understand intent. Note the issue type (bug, feature, chore) — it shapes the commit type and branch prefix.

2. If not already on a feature branch, create one. Pick a prefix that matches intent (`fix/`, `feat/`, `chore/`, `refactor/`, `docs/`):

   ```bash
   git checkout -b <prefix>/issue-$ARGUMENTS-<short-slug>
   ```

3. Explore the relevant code before changing anything. House rules (`.claude/rules/`) and project conventions (`.claude/CLAUDE.md`) are already in context — follow them; don't re-derive.

4. If the change requires a Prisma schema update:
   - Edit `apps/server/prisma/schema.prisma`
   - `pnpm --filter my-wallet-server db:migrate` — name the migration for the change itself (e.g. `add_notes_to_snapshot`), not the issue
   - `pnpm --filter my-wallet-server db:generate`

5. Implement the change. Cover the new behaviour with tests in the same pass.

6. For frontend changes, verify in a browser using the `verify` skill rather than starting the dev server inline.

7. Validate:

   ```bash
   pnpm --filter my-wallet-server test   # server changes
   pnpm --filter my-wallet-web test      # web changes
   pnpm test                             # both
   pnpm typecheck
   pnpm lint
   ```

8. Summarise what changed and why. Do not commit or open a PR unless the user asks. When asked to open a PR, include `Closes #$ARGUMENTS` in the body and use the Conventional Commit type that matches the issue (`feat:`, `fix:`, `chore:`, etc.).
