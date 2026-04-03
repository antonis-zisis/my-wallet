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

RUN pnpm --filter server build

# -- Production stage --
FROM node:24-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/server/package.json apps/server/

RUN pnpm install --frozen-lockfile --ignore-scripts --prod

COPY --from=build /app/apps/server/dist apps/server/dist/
COPY --from=build /app/apps/server/src/generated/prisma apps/server/src/generated/prisma/
COPY --from=build /app/apps/server/prisma apps/server/prisma/

EXPOSE 4000

CMD ["node", "apps/server/dist/index.js"]
