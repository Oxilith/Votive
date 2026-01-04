# Frontend Dockerfile for Kubernetes
# Serves static files via nginx on HTTP only (Ingress handles TLS)

FROM node:24-slim AS builder

WORKDIR /app

# Copy workspace config
COPY package.json package-lock.json ./
COPY tsconfig.base.json ./
COPY shared/package.json shared/
COPY app/package.json app/

# Install all dependencies
RUN npm ci --workspaces --include-workspace-root

# Build shared
COPY shared/src shared/src
COPY shared/tsconfig.json shared/
COPY shared/tsup.config.ts shared/
RUN npm run build -w shared

# Build app
COPY app/src app/src
COPY app/public app/public
COPY app/index.html app/
COPY app/tsconfig.json app/
COPY app/tsconfig.app.json app/
COPY app/tsconfig.node.json app/
COPY app/tsconfig.test.json app/
COPY app/vite.config.ts app/
COPY app/postcss.config.* app/

RUN npm run build -w app

# Production - nginx serving static files
FROM nginx:1.28.1

RUN apt-get update && apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Copy static files
COPY --from=builder /app/app/dist /usr/share/nginx/html

# Note: nginx.conf is provided via ConfigMap in K8s
# This default config is for standalone testing only
RUN echo 'server { \
    listen 80; \
    server_name _; \
    location /health { return 200 "OK"; add_header Content-Type text/plain; } \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
