# Create a Prisma database migration for: $ARGUMENTS

## Steps

### 1. Edit the schema

Open `apps/server/prisma/schema.prisma` and make the required model changes.

Common patterns:

- New optional field: `fieldName   Type?`
- New required field with default: `fieldName   Type   @default(value)`
- New model: follow the existing pattern — always include `id String @id @default(cuid())`, `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`, and a `userId String` with a relation to `User`
- Cascade deletes: `onDelete: Cascade` on the relation field when child records should be removed with the parent

### 2. Run the migration

```bash
pnpm --filter my-wallet-server db:migrate
```

When prompted for a migration name, use lowercase snake_case describing the change:

- `add_<field>_to_<model>` — for new fields
- `add_<model>` — for new models
- `remove_<field>_from_<model>` — for removed fields
- `rename_<old>_to_<new>_on_<model>` — for renames

### 3. Regenerate the Prisma client

```bash
pnpm --filter my-wallet-server db:generate
```

This updates the TypeScript types in `apps/server/src/generated/prisma/`.

### 4. Update the GraphQL schema

If the migration adds fields that should be queryable:

- Update `apps/server/src/graphql/<domain>/schema.ts` to expose the new fields
- Update `apps/server/src/graphql/<domain>/resolvers.ts` if field-level resolver logic is needed
- Update `apps/web/src/graphql/<domain>.ts` queries/mutations to include the new fields

### 5. Verify

Run tests to ensure nothing broke:

```bash
pnpm --filter my-wallet-server test
```

Check that the generated migration file in `apps/server/prisma/migrations/` looks correct before treating the work as done.

## What NOT to do

- Don't edit existing migration files — always create a new migration
- Don't run `prisma migrate reset` unless you explicitly need to wipe the local DB
- Don't commit `.env` files
