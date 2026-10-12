# -- Build stage --
FROM node:24-slim AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/server/package.json apps/server/
COPY apps/server/prisma apps/server/prisma/

RUN pnpm install --frozen-lockfile --ignore-scripts

COPY apps/server apps/server/

RUN pnpm --filter my-wallet-server build

RUN pnpm --filter my-wallet-server deploy --prod --no-optional /deploy

# -- Production stage --
FROM node:24-alpine

WORKDIR /app

COPY --from=build --chown=node:node /deploy/package.json ./
COPY --from=build --chown=node:node /deploy/node_modules node_modules/
COPY --from=build --chown=node:node /app/apps/server/dist dist/

EXPOSE 4000

USER node

CMD ["node", "dist/index.js"]
