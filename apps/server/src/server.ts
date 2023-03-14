import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { PrismaClient } from "database";
import { parse } from "cookie";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { json } from "express";
import { applyMiddleware } from "graphql-middleware";
import { useServer } from "graphql-ws/lib/use/ws";
import { createServer } from "http";
import "reflect-metadata";
import { WebSocketServer } from "ws";
import { createContext, createPermissions } from "./common";
import { resolvers, typeDefs } from "./graphql";
import { generateConversationModel, generateMessageModel } from "./models";

dotenv.config({ path: "../.env" });

(async () => {
  const port = process.env.PORT || 8000;
  const app = express();
  const httpServer = createServer(app);
  const dbClient = new PrismaClient();

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  const schema = applyMiddleware(makeExecutableSchema({ typeDefs, resolvers }), createPermissions());

  // Hand in the schema we just created and have the WebSocketServer start listening.
  const serverCleanup = useServer(
    {
      schema,
      onConnect: async (ctx) => {
        const { sessionId } = parse(ctx.extra.request.headers.cookie ?? "");
        if (!sessionId) {
          throw new Error("Invalid session error!");
        }
        try {
          await dbClient.user.findUniqueOrThrow({ where: { sessionId } });
        } catch (error) {
          throw new Error("Invalid session error!");
        }
      },
      context: async (ctx) => {
        const { sessionId } = parse(ctx.extra.request.headers.cookie ?? "");
        if (sessionId) {
          const user = await dbClient.user.findUniqueOrThrow({ where: { sessionId }, select: { id: true } });
          return {
            userId: user.id,
            models: {
              Message: generateMessageModel({ db: dbClient }),
              Conversation: generateConversationModel({ db: dbClient }),
            },
          };
        }
        return { userId: null };
      },
    },
    wsServer,
  );

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      { serverWillStart: async () => ({ drainServer: async () => serverCleanup.dispose() }) },
    ],
  });

  await server.start();

  app.use(
    "/graphql",
    cors<cors.CorsRequest>({
      origin: ["http://localhost:3000", "https://studio.apollographql.com"],
      credentials: true,
    }),
    json(),
    cookieParser(),
    expressMiddleware(server, { context: async (ctx) => await createContext(ctx, dbClient) }),
  );

  httpServer.listen(port, () => {
    console.log(`🚀 Server ready at http://localhost:${port}`);
  });
})();
