import { ExpressContextFunctionArgument } from "@apollo/server/express4";
import { parse } from "cookie";
import { generateAuthModel, generateConversationModel, generateMessageModel, generateUserModel } from "../models";
import { DatabaseClient, MyContext } from "../types";

export const createContext = async (
  ctx: ExpressContextFunctionArgument,
  dbClient: DatabaseClient,
): Promise<MyContext> => {
  const { req, res } = ctx;
  let userId = null;
  const { sessionId } = parse(req.headers.cookie ?? "");
  if (sessionId) {
    const user = await dbClient.user.findUnique({ where: { sessionId }, select: { id: true } });
    userId = user?.id ?? null;
  }

  return {
    userId,
    models: {
      User: generateUserModel({ db: dbClient }),
      Auth: generateAuthModel({ res, db: dbClient, userId }),
      Message: generateMessageModel({ db: dbClient }),
      Conversation: generateConversationModel({ db: dbClient }),
    },
  };
};
