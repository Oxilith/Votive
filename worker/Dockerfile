# Worker Dockerfile
# Background job worker for Votive

# Stage 1: Build
FROM node:22-alpine AS builder

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy root package files for workspace resolution
COPY package.json package-lock.json ./

# Copy all workspace package.json files
COPY shared/package.json shared/
COPY worker/package.json worker/

# Install all workspaces
RUN npm ci --workspaces --include-workspace-root

# Copy shared source and build it first
COPY shared/src shared/src
COPY shared/tsconfig.json shared/

WORKDIR /app/shared
RUN npm run build

# Copy worker source, prisma schema, and build
WORKDIR /app/worker
COPY worker/prisma ./prisma/
COPY worker/src ./src
COPY worker/tsconfig.json ./

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Stage 2: Production
FROM node:22-alpine AS runner

# Install OpenSSL for Prisma runtime
RUN apk add --no-cache openssl

WORKDIR /app

ENV NODE_ENV=production

# Copy root package files
COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY worker/package.json worker/

# Install production dependencies only
RUN npm ci --workspaces --include-workspace-root --omit=dev

# Copy built shared package
COPY --from=builder /app/shared/dist shared/dist

# Copy built worker and prisma
COPY --from=builder /app/worker/dist worker/dist
COPY --from=builder /app/worker/prisma worker/prisma
COPY --from=builder /app/worker/node_modules/.prisma worker/node_modules/.prisma

WORKDIR /app/worker

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 workerjs && \
    chown -R workerjs:nodejs /app

USER workerjs

# Start the worker
CMD ["node", "dist/index.js"]
