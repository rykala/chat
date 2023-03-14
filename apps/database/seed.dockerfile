FROM node:19-alpine AS builder
RUN apk add --no-cache libc6-compat
RUN apk update
RUN npm -g install turbo@1.8.3

WORKDIR /app
COPY . .
RUN turbo prune --scope=database --docker

FROM node:19-alpine AS installer
RUN npm -g install pnpm@7.14.0
WORKDIR /app

# Install dependencies
COPY --from=builder /app/out/pnpm-lock.yaml .
RUN pnpm fetch
COPY --from=builder /app/out/json/ .
RUN pnpm install -r --offline
COPY --from=builder /app/out/full/ .

FROM node:19-alpine AS runner
RUN npm -g install pnpm@7.14.0
WORKDIR /app

COPY --from=installer /app/node_modules/ ./node_modules/
COPY --from=installer /app/apps/database/package.json ./apps/database/
COPY --from=installer /app/apps/database/node_modules/ ./apps/database/node_modules/
COPY --from=installer /app/apps/database/prisma/ ./apps/database/prisma/

CMD pnpm --filter database db:generate && pnpm --filter database db:seed

