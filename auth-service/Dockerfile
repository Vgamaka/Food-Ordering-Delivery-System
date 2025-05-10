# ┌────────────── Stage 1: install dependencies ──────────────
FROM node:20-alpine AS deps

# where our app lives inside the container
WORKDIR /usr/src/app

# only copy package manifests, install prod deps
COPY package.json package-lock.json ./
RUN npm ci --only=production

# ┌────────────── Stage 2: build final image ────────────────
FROM node:20-alpine

WORKDIR /usr/src/app

# copy prod deps from deps stage
COPY --from=deps /usr/src/app/node_modules ./node_modules

# copy app source
COPY . .

# ensure uploads directory exists and is writable by node user
RUN mkdir -p /usr/src/app/uploads \
    && chown -R node:node /usr/src/app/uploads

# set production env (disables dev-only code paths)
ENV NODE_ENV=production

# expose the port your app listens on
EXPOSE 3001

# run as a non-root user for better security
USER node

# simple healthcheck (requires wget in the image)
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/ || exit 1

# start your app
CMD ["node", "src/index.js"]