# ─── ShifaMart+ Backend ──────────────────────────────────────────────────────
FROM node:20-alpine

# Install dumb-init for proper PID 1 signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy dependency manifests first (better layer cache)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --frozen-lockfile

# Copy application source
COPY . .

# Writable upload dirs for non-root runtime (USER node cannot mkdir under root-owned uploads)
RUN mkdir -p uploads/avatars && chown -R node:node uploads

# Drop root privileges
USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

# Use dumb-init so SIGTERM is forwarded correctly to Node
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "index.js"]
