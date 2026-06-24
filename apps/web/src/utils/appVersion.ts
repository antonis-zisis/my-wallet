// `__APP_VERSION__` is injected at build time by Vite (see vite.config.ts),
// sourced from apps/web/package.json — the single source of truth for the
// monorepo version. The `typeof` guard keeps this safe in any context where the
// define isn't applied (it returns 'undefined' rather than throwing).
export const APP_VERSION =
  typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '0.0.0';
