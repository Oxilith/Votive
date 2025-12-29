# Worker Dockerfile
# Background job worker for Votive

FROM node:22-alpine AS base
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
# Install dependencies required for native modules
RUN apk add --no-cache libc6-compat
COPY package*.json ./
COPY worker/package*.json ./worker/
COPY shared/package*.json ./shared/
RUN npm ci --workspace=worker --workspace=shared

# Build the application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/worker/node_modules ./worker/node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules
COPY shared ./shared
COPY worker ./worker

# Build shared package first
WORKDIR /app/shared
RUN npm run build

# Generate Prisma client and build worker
WORKDIR /app/worker
RUN npx prisma generate
RUN npm run build

# Production image
FROM base AS runner
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 workerjs

# Copy built files
COPY --from=builder --chown=workerjs:nodejs /app/worker/dist ./dist
COPY --from=builder --chown=workerjs:nodejs /app/worker/node_modules ./node_modules
COPY --from=builder --chown=workerjs:nodejs /app/shared/dist ./node_modules/shared
COPY --from=builder --chown=workerjs:nodejs /app/worker/prisma ./prisma

USER workerjs

# Start the worker
CMD ["node", "dist/worker/src/index.js"]
