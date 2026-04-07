# Fix GitHub issue #$ARGUMENTS from this repository

## Steps

1. Fetch the issue details:

   ```bash
   gh issue view $ARGUMENTS
   ```

2. Read the issue title, description, and any comments to fully understand what needs fixing.

3. Explore the relevant code — find the files related to the reported problem before writing any changes.

4. Implement the fix following the project conventions:
   - No abbreviations in variable names
   - Sorted destructure keys
   - Resolver ownership checks (userId) on all data access
   - Tests covering the fixed behaviour

5. Run the relevant tests to verify the fix:

   ```bash
   pnpm --filter my-wallet-server test   # for server changes
   pnpm --filter my-wallet-web test      # for web changes
   pnpm test                             # for both
   ```

6. Run lint:

   ```bash
   pnpm lint
   ```

7. Summarise what was changed and why — don't commit unless explicitly asked.
