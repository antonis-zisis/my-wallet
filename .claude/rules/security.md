---
description: Security rules to follow when writing any code in this project.
---

This rule is a prior on how you write code, not the only line of defence. Hooks and review agents catch what slips through — your job is to make their work boring. Rules are phrased as **trigger → action**: when the trigger applies, do the action.

## Authentication & authorisation

- **Reading identity (`userId`, `email`) → take it from GraphQL context.** Never from arguments, input, request body, or headers other than the verified `Authorization`.
- **Mutating a user-owned record → verify ownership first** with `findFirst({ where: { id, userId } })`. Never `update`/`delete({ where: { id } })` directly.
- **Adding a query or mutation → it must require auth.** If you intentionally write an unauthenticated resolver, call it out in the response; don't ship it silently.

## Input validation

- **Adding or modifying a mutation input → route every field through `apps/server/src/lib/validate.ts`** before touching the database. If a check you need isn't there, add it there rather than inlining ad-hoc validation.
- Strings: length limit. Numbers: finiteness + range. Dates: validated before `new Date()`. Enums: runtime validation (TypeScript types are not enforced on the wire).
- **Adding a new schema enum → add a matching runtime validator in the same change.**

## Database access

- **Writing a Prisma list query → include `take` with a sane upper bound, or use `clampPage()`.** No unbounded `findMany`.
- **About to use `$queryRawUnsafe` or string-built SQL → don't.** Use Prisma's query builder, or tagged-template `$queryRaw\`...\`` so parameters are bound.

## GraphQL

- **Throwing from a resolver → throw `GraphQLError` with a safe, user-facing message.** Internal detail goes in `extensions` or the server log, never the message.
- **Catching an error → never echo `error.message` or `error.stack` to the client.**
- Avoid unbounded nested resolvers that cause N+1 at scale.

## Frontend (React)

- **About to use `dangerouslySetInnerHTML` → don't**, unless the content is sanitised by a verified sanitiser in the same expression. No "sanitised upstream" assumptions.
- **Rendering a user-controlled value into `href`, `src`, or `style` → validate with `isSafeUrl` first.**
- **About to `console.log` near auth, session, or token code → don't.** Even in dev.

## Sensitive data

- Never return secrets, tokens, password hashes, or unnecessary PII in GraphQL responses.

## Secrets & configuration

- **About to write a literal secret (API key, token, password, connection string) in source → stop.** Put it in `.env` (gitignored), read via `process.env.X`, add a placeholder to `.env.example`.
- **Adding a new `process.env.X` read → add the placeholder to `.env.example` in the same change.**
- Never commit `.env`, `.env.local`, or any file with real credentials.

## CSRF

- Never set session cookies — auth uses `Authorization: Bearer` headers only.

## Dependencies

- **Adding a new npm dependency → name it explicitly in the response and pause for confirmation** if the project doesn't already use it. Prefer well-known, maintained packages.

## When this rule conflicts with the task

If following the rule would block what the user asked for (e.g. "add an admin endpoint that reads any user's data"), state the conflict and ask. Do not silently bypass. The user can grant an exception; you cannot grant one to yourself.
