# ┌──────────── Stage 1: Install dependencies ─────────────
FROM node:20-alpine AS deps
WORKDIR /usr/src/app

# Only copy manifest files, install prod deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# ┌──────────── Stage 2: Build minimal runtime image ──────
FROM node:20-alpine
WORKDIR /usr/src/app

# Copy prod node_modules from deps stage
COPY --from=deps /usr/src/app/node_modules ./node_modules

# Copy application source
COPY . .

# Force production mode
ENV NODE_ENV=production

# Expose the port this service listens on
EXPOSE 3002

# Run as non-root user for better security
USER node

# Healthcheck so Kubernetes can verify readiness
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3002/ || exit 1

# Start the service
CMD ["node", "src/index.js"]
