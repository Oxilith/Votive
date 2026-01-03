# Worker Dockerfile
# Using Debian slim for consistency and libsql native module compatibility
FROM node:24-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends openssl && \
    rm -rf /var/lib/apt/lists/*

RUN npm install -g @dotenvx/dotenvx

WORKDIR /app

# Copy workspace config
COPY package.json package-lock.json ./
COPY tsconfig.base.json ./
COPY shared/package.json shared/
COPY worker/package.json worker/

# Install all dependencies
RUN npm ci --workspaces --include-workspace-root

# Generate Prisma client (uses prompt-service schema, outputs to shared/src/generated)
COPY prompt-service/prisma prompt-service/prisma
RUN npx prisma generate --schema=prompt-service/prisma/schema.prisma

# Build shared
COPY shared/src shared/src
COPY shared/tsconfig.json shared/
COPY shared/tsup.config.ts shared/
RUN npm run build -w shared

# Build worker
COPY worker/src worker/src
COPY worker/prisma worker/prisma
COPY worker/tsconfig.json worker/
COPY worker/tsup.config.ts worker/
RUN npm run build -w worker

# Production
FROM node:24-slim

RUN apt-get update && apt-get install -y --no-install-recommends openssl && \
    rm -rf /var/lib/apt/lists/* && \
    npm install -g @dotenvx/dotenvx

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY worker/package.json worker/

RUN npm ci --workspaces --include-workspace-root --omit=dev

COPY --from=builder /app/shared/dist shared/dist
COPY --from=builder /app/worker/dist worker/dist
COPY --from=builder /app/worker/prisma worker/prisma
COPY .env worker/.env

RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs appuser && \
    chown -R appuser:nodejs /app

USER appuser
WORKDIR /app/worker


CMD ["npx", "dotenvx", "run", "--", "node", "dist/index.js"]
