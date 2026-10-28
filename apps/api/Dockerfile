FROM node:22-alpine AS builder

WORKDIR /app

# Copy package manifests and yarn release
COPY package.json yarn.lock .yarnrc ./
COPY .yarn .yarn

# Install all dependencies
RUN yarn install --frozen-lockfile --ignore-engines

# Copy root configs and source files needed for build
COPY nx.json tsconfig.base.json eslint.config.mjs ./
COPY apps/api apps/api
COPY libs libs

# Build the production bundle
RUN npx nx build api --configuration=production

# Production runner stage
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy installed modules and built application
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/api ./dist/apps/api

EXPOSE 3000

CMD ["node", "dist/apps/api/main.js"]
