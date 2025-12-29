# Backend Dockerfile
# API proxy for Votive

# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root package files for workspace resolution
COPY package.json package-lock.json ./

# Copy all workspace package.json files
COPY shared/package.json shared/
COPY backend/package.json backend/

# Install all workspaces
RUN npm ci --workspaces --include-workspace-root

# Copy shared source and build it first
COPY shared/src shared/src
COPY shared/tsconfig.json shared/

WORKDIR /app/shared
RUN npm run build

# Copy backend source and build
WORKDIR /app/backend
COPY backend/src ./src
COPY backend/tsconfig.json ./

RUN npm run build

# Stage 2: Production
FROM node:22-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Update npm to fix CVE-2025-64756 (glob vulnerability) and install wget for health checks
RUN npm install -g npm@latest && \
    apk add --no-cache wget

# Copy root package files
COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY backend/package.json backend/

# Install production dependencies only
RUN npm ci --workspaces --include-workspace-root --omit=dev

# Copy built shared package
COPY --from=builder /app/shared/dist shared/dist

# Copy built backend
COPY --from=builder /app/backend/dist backend/dist

WORKDIR /app/backend

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs && \
    chown -R expressjs:nodejs /app

USER expressjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Start server
CMD ["node", "dist/index.js"]
