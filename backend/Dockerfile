# Backend Dockerfile
# API proxy for Votive

# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy and build shared package first
COPY shared/package.json ./shared/
COPY shared/src ./shared/src
COPY shared/tsconfig.json ./shared/

WORKDIR /app/shared
RUN npm install
RUN npx tsc

# Create production package.json for the built output and pack it
RUN echo '{"name":"shared","version":"1.0.0","type":"module","main":"./index.js","exports":{".":"./index.js","./*.js":"./*.js","./*":"./*.js"}}' > dist/package.json
RUN cd dist && npm pack

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./backend/

# Install backend dependencies, replacing shared with the packed tarball
WORKDIR /app/backend
RUN npm pkg delete dependencies.shared && npm install && npm install ../shared/dist/shared-1.0.0.tgz

# Copy backend source code
COPY backend/src ./src
COPY backend/tsconfig.json ./

# Build TypeScript
RUN npm run build

# Stage 2: Production
FROM node:22-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Update npm to fix CVE-2025-64756 (glob vulnerability) and install wget for health checks
RUN npm install -g npm@latest && \
    apk add --no-cache wget

# Copy built files and production dependencies
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./

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
