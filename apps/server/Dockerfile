FROM node:19-alpine AS image

FROM image AS builder
RUN apk add --no-cache libc6-compat
RUN apk update
RUN npm -g install turbo@1.8.3

WORKDIR /app
COPY . .
RUN turbo prune --scope=server --docker

# Add lockfile and package.json's of isolated subworkspace
FROM image AS installer
RUN apk add --no-cache libc6-compat python3
RUN apk update
RUN npm -g install pnpm@7.14.0
WORKDIR /app

# Install dependencies
COPY --from=builder /app/out/pnpm-lock.yaml .
RUN pnpm fetch
COPY --from=builder /app/out/json/ .
RUN pnpm install -r --offline

# Build the project
COPY --from=builder /app/out/full/ .
RUN pnpm turbo build --filter=server...

FROM image AS runner
RUN npm -g install pnpm@7.14.0
WORKDIR /app

COPY --from=installer /app/apps/server/node_modules ./apps/server/node_modules
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/apps/server/dist ./apps/server

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs
USER expressjs

CMD node apps/server/server.js