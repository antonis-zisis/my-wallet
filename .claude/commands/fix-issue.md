# Fix GitHub issue #$ARGUMENTS from this repository

## Steps

1. Fetch the issue details:

   ```bash
   gh issue view $ARGUMENTS
   ```

2. Read the issue title, description, and comments to fully understand what needs fixing. Check for any linked PRs or related issues that provide additional context.

3. Create a branch for the fix:

   ```bash
   git checkout -b fix/issue-$ARGUMENTS
   ```

4. Explore the relevant code — find the files related to the reported problem before writing any changes.

5. If the fix requires a database schema change, follow the migration steps:
   - Edit `apps/server/prisma/schema.prisma`
   - Run `pnpm --filter my-wallet-server db:migrate` (name the migration `fix_<description>`)
   - Run `pnpm --filter my-wallet-server db:generate`

6. Implement the fix following the project conventions:
   - No abbreviations in variable names (e.g. `transaction` not `tx`)
   - Sorted destructure keys
   - Sorted imports (`eslint-plugin-simple-import-sort`)
   - Identifiers ≥ 2 characters
   - Resolver ownership checks (`userId`) on all data access
   - Tests covering the fixed behaviour

7. For frontend (web) changes, start the dev server and verify the fix visually in a browser:

   ```bash
   pnpm dev:web
   ```

   Test the golden path and any edge cases. Look for regressions in nearby features.

8. Run the relevant tests:

   ```bash
   pnpm --filter my-wallet-server test   # for server changes
   pnpm --filter my-wallet-web test      # for web changes
   pnpm test                             # for both
   ```

9. Run typecheck:

   ```bash
   pnpm typecheck
   ```

10. Run lint:

    ```bash
    pnpm lint
    ```

11. Summarise what was changed and why — don't commit or open a PR unless explicitly asked. When asked to open a PR, use `Closes #$ARGUMENTS` in the body.
