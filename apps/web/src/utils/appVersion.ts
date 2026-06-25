// `__APP_VERSION__` is injected at build time by Vite (see vite.config.ts)
export const APP_VERSION =
  typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '0.0.0';
