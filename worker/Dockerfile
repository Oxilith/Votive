# Worker Dockerfile
# Background job worker for Votive

# Stage 1: Build
FROM node:22-alpine AS builder

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

# Copy worker package files
COPY worker/package*.json ./worker/
COPY worker/prisma ./worker/prisma/

# Install worker dependencies, replacing shared with the packed tarball
WORKDIR /app/worker
RUN npm pkg delete dependencies.shared && npm install && npm install ../shared/dist/shared-1.0.0.tgz

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY worker/src ./src
COPY worker/tsconfig.json ./

# Build TypeScript
RUN npm run build

# Stage 2: Production
FROM node:22-alpine AS runner

# Install OpenSSL for Prisma runtime
RUN apk add --no-cache openssl

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 workerjs

# Copy built files and production dependencies
COPY --from=builder /app/worker/dist ./dist
COPY --from=builder /app/worker/node_modules ./node_modules
COPY --from=builder /app/worker/prisma ./prisma

RUN chown -R workerjs:nodejs /app

USER workerjs

# Start the worker
CMD ["node", "dist/index.js"]
