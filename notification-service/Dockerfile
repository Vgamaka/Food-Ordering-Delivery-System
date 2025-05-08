# ┌──────────── Stage 1: Install dependencies ─────────────
FROM node:20-alpine AS deps
WORKDIR /usr/src/app

# Copy only package manifests for a clean install
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# ┌──────────── Stage 2: Build minimal runtime image ───────
FROM node:20-alpine
WORKDIR /usr/src/app

# Copy only production modules from deps stage
COPY --from=deps /usr/src/app/node_modules ./node_modules

# Copy application source
COPY . .

# Ensure production flags
ENV NODE_ENV=production

# Expose the service port
EXPOSE 3004

# Run as non-root user
USER node

# Basic healthcheck for Kubernetes readiness
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3004/ || exit 1

# Start the service
CMD ["node", "src/index.js"]
