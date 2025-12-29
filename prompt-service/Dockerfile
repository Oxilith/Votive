# Prompt Service Dockerfile
# Prompt management microservice for Votive

# Stage 1: Build
FROM node:20-alpine AS builder

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

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

# Copy prompt-service package files
COPY prompt-service/package.json ./prompt-service/
COPY prompt-service/prisma ./prompt-service/prisma/

# Install prompt-service dependencies, replacing shared with the packed tarball
WORKDIR /app/prompt-service
RUN npm pkg delete dependencies.shared && npm install && npm install ../shared/dist/shared-1.0.0.tgz

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY prompt-service/. .

# Build the application
RUN npm run build:server
RUN npm run build:admin

# Stage 2: Production
FROM node:20-alpine

# Install OpenSSL for Prisma runtime
RUN apk add --no-cache openssl

WORKDIR /app

# Copy built files from prompt-service directory
COPY --from=builder /app/prompt-service/dist ./dist
COPY --from=builder /app/prompt-service/node_modules ./node_modules
COPY --from=builder /app/prompt-service/prisma ./prisma
COPY --from=builder /app/prompt-service/package.json ./

# Create data directory for SQLite
RUN mkdir -p /app/data

ENV NODE_ENV=production
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
# Seed uses custom prisma client so it works with both encrypted and unencrypted DBs
CMD ["sh", "-c", "if [ -n \"$DATABASE_KEY\" ]; then node dist/scripts/migrate.js; else npx prisma migrate deploy; fi && node dist/prisma/seed.js && node dist/src/index.js"]
