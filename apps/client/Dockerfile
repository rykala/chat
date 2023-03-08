FROM node:19-alpine AS builder
RUN apk add --no-cache libc6-compat
RUN apk update
RUN npm -g install turbo@1.8.3

WORKDIR /app
COPY . .
RUN turbo prune --scope=client --docker

FROM node:19-alpine AS installer
RUN apk add --no-cache libc6-compat python3
RUN apk update
RUN npm -g install pnpm@7.14.0
WORKDIR /app

# Install dependencies
COPY --from=builder /app/out/pnpm-lock.yaml .
RUN pnpm fetch
COPY --from=builder /app/out/json/ .
RUN pnpm install -r --offline

COPY --from=builder /app/out/full/ .
RUN pnpm turbo run build --filter=client...

FROM nginx AS runner
COPY --from=installer /app/apps/client/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
