# ┌──────────── Stage 1: Build the app ─────────────
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# ┌──────────── Stage 2: Serve with Nginx ──────────
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html

# Remove default content
RUN rm -rf ./*

# Copy built assets
COPY --from=builder /usr/src/app/dist .

# Copy custom nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Run Nginx
CMD ["nginx", "-g", "daemon off;"]
