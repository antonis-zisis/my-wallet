# -- Build stage --
FROM node:24-slim AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/backend/package.json packages/backend/
COPY packages/backend/prisma packages/backend/prisma/

RUN pnpm install --frozen-lockfile --ignore-scripts

COPY packages/backend packages/backend/

RUN pnpm --filter backend build

# -- Production stage --
FROM node:24-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/backend/package.json packages/backend/

RUN pnpm install --frozen-lockfile --ignore-scripts --prod

COPY --from=build /app/packages/backend/dist packages/backend/dist/
COPY --from=build /app/packages/backend/src/generated/prisma packages/backend/src/generated/prisma/
COPY --from=build /app/packages/backend/prisma packages/backend/prisma/

EXPOSE 4000

CMD ["node", "packages/backend/dist/index.js"]
