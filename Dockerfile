# syntax=docker/dockerfile:1.7

FROM node:22-slim AS base
ENV NODE_ENV=production
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.7.0 --activate

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod=false --filter @lovehold/api...

FROM deps AS builder
COPY tsconfig.base.json ./
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared
RUN pnpm --filter @lovehold/shared build
RUN pnpm --filter @lovehold/api exec prisma generate --schema prisma/schema.prisma
RUN pnpm --filter @lovehold/api build
RUN pnpm deploy --filter @lovehold/api --prod --legacy /app/deploy

FROM node:22-slim AS runner
ENV NODE_ENV=production
ENV PORT=3001
ENV NODE_OPTIONS=--max-old-space-size=160
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/deploy/ ./
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/prisma ./prisma
EXPOSE 3001
CMD ["node", "dist/main"]
