# Stage 1: Build
FROM node:22-alpine AS builder

# Update npm to fix CVE-2025-64756 (glob vulnerability)
RUN npm install -g npm@latest

WORKDIR /app

# Copy shared package first
COPY shared/package.json ./shared/
COPY shared/src ./shared/src
COPY shared/tsconfig.json ./shared/

# Install shared package dependencies
WORKDIR /app/shared
RUN npm install

WORKDIR /app

# Copy frontend package files
COPY app/package*.json ./app/

# Install frontend dependencies (use npm install since workspaces don't have individual lockfiles)
WORKDIR /app/app
RUN npm install

# Copy frontend source code and configs
COPY app/src ./src
COPY app/public ./public
COPY app/index.html ./
COPY app/tsconfig.json ./
COPY app/tsconfig.app.json ./
COPY app/tsconfig.node.json ./
COPY app/vite.config.ts ./
COPY app/postcss.config.js ./

# Build application
RUN npm run build

# Stage 2: Production with Nginx
FROM nginx:alpine AS runner

# Install openssl for certificate generation
RUN apk add --no-cache openssl

# Create SSL directory for certificates
RUN mkdir -p /etc/nginx/ssl

# Copy entrypoint script
COPY app/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Copy built files to nginx
COPY --from=builder /app/app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY app/nginx.conf /etc/nginx/conf.d/default.conf

# Expose ports (80 for redirect, 443 for HTTPS)
EXPOSE 80 443

# Health check on HTTPS
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider --no-check-certificate https://localhost:443/ || exit 1

# Use custom entrypoint for certificate generation
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
