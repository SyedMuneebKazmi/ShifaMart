# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

# Copy source code
COPY . .

# Build arguments (injected at build time by Coolify / docker-compose)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build production bundle
RUN npm run build

# ─── Stage 2: Serve with Nginx ───────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# MSW service worker is not needed in production – remove if present
RUN rm -f /usr/share/nginx/html/mockServiceWorker.js

EXPOSE 80

# Use 127.0.0.1: busybox wget often resolves "localhost" to ::1 first; `listen 80` can be IPv4-only → connection refused.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=5 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
