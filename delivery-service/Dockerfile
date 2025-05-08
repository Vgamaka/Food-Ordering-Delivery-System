# ┌────────── Stage 1: Install dependencies ──────────
FROM node:20-alpine AS deps
WORKDIR /usr/src/app

# Copy only manifest files and install prod deps (omit devDeps)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ┌────────── Stage 2: Build minimal runtime image ────
FROM node:20-alpine
WORKDIR /usr/src/app

# Copy installed prod modules from deps stage
COPY --from=deps /usr/src/app/node_modules ./node_modules

# Copy app source
COPY . .

# Force production mode (disable any dev branches in code)
ENV NODE_ENV=production

# Expose the port this service listens on
EXPOSE 3002

# Drop to non-root user for security
USER node

# Optional healthcheck so Kubernetes knows when the container is healthy
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3002/ || exit 1

# Launch the service
CMD ["node", "src/index.js"]
