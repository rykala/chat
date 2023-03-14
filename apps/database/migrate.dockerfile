FROM node:19-alpine AS migrate
RUN npm install -g prisma
WORKDIR /app
COPY /apps/database/prisma/ ./prisma/
CMD prisma migrate deploy
