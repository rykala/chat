FROM node:19-alpine
RUN npm install -g prisma
WORKDIR /app
COPY /apps/server/prisma/ ./prisma/
CMD prisma migrate deploy
