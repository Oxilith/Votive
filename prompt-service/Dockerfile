# Prompt Service Dockerfile
# Prompt management microservice for Votive

# Stage 1: Build
FROM node:20-alpine AS builder

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy root package files for workspace resolution
COPY package.json package-lock.json ./

# Copy all workspace package.json files
COPY shared/package.json shared/
COPY prompt-service/package.json prompt-service/

# Install all workspaces
RUN npm ci --workspaces --include-workspace-root

# Copy shared source and build it first
COPY shared/src shared/src
COPY shared/tsconfig.json shared/

WORKDIR /app/shared
RUN npm run build

# Copy prompt-service source and build
WORKDIR /app/prompt-service
COPY prompt-service/prisma ./prisma/
COPY prompt-service/src ./src
COPY prompt-service/scripts ./scripts
COPY prompt-service/tsconfig.json ./
COPY prompt-service/vite.config.ts ./
COPY prompt-service/index.html ./

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build:server
RUN npm run build:admin

# Stage 2: Production
FROM node:20-alpine

# Install OpenSSL for Prisma runtime
RUN apk add --no-cache openssl

WORKDIR /app

ENV NODE_ENV=production

# Copy root package files
COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY prompt-service/package.json prompt-service/

# Install production dependencies only
RUN npm ci --workspaces --include-workspace-root --omit=dev

# Copy built shared package
COPY --from=builder /app/shared/dist shared/dist

# Copy built prompt-service
COPY --from=builder /app/prompt-service/dist prompt-service/dist
COPY --from=builder /app/prompt-service/prisma prompt-service/prisma
COPY --from=builder /app/prompt-service/node_modules/.prisma prompt-service/node_modules/.prisma

WORKDIR /app/prompt-service

# Create data directory for SQLite
RUN mkdir -p /app/data

ENV DATABASE_URL=file:/app/data/prompts.db

EXPOSE 3002

# Health check configuration:
# - Uses Node.js fetch since wget/curl are not available in Alpine by default
# - Explicitly checks response.ok (HTTP 200-299) for success
# - interval: Check every 30s after container is running
# - timeout: Fail if health check takes longer than 10s
# - start-period: Allow 10s for service to initialize before counting failures
# - retries: Mark unhealthy after 3 consecutive failures
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:3002/health').then(r => { if (!r.ok) throw new Error('Health check failed: ' + r.status); }).catch(e => { console.error(e.message); process.exit(1); })"

# Run migrations, seed, and start server
# If DATABASE_KEY is set, use custom libsql migration script (encrypted)
# Otherwise, use standard Prisma migrate deploy (unencrypted)
CMD ["sh", "-c", "if [ -n \"$DATABASE_KEY\" ]; then node dist/scripts/migrate.js; else npx prisma migrate deploy; fi && node dist/prisma/seed.js && node dist/src/index.js"]
