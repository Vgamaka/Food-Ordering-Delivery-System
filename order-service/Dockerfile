# ┌───────────── Stage 1: Install dependencies ─────────────
FROM node:20-alpine AS deps
WORKDIR /usr/src/app

# Copy manifest files and install only production deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# ┌───────────── Stage 2: Build minimal runtime image ──────
FROM node:20-alpine
WORKDIR /usr/src/app

# Copy prod node_modules from the deps stage
COPY --from=deps /usr/src/app/node_modules ./node_modules

# Copy app source
COPY . .

# Ensure production mode
ENV NODE_ENV=production

# Expose the service port
EXPOSE 3003

# Drop root privileges
USER node

# Healthcheck for Kubernetes readiness
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3003/ || exit 1

# Start the app
CMD ["node", "src/index.js"]
