import type { PubSub } from "graphql-subscriptions";
import { generateAuthModel, generateConversationModel, generateMessageModel, generateUserModel } from "../models";

export type { Request, Response } from "express";
export type { PrismaClient as DatabaseClient } from "database";
export type { PubSub };

export interface MyContext {
  models: {
    Auth: ReturnType<typeof generateAuthModel>;
    Conversation: ReturnType<typeof generateConversationModel>;
    Message: ReturnType<typeof generateMessageModel>;
    User: ReturnType<typeof generateUserModel>;
  };
  userId: string | null;
}

export * from "./generated-types";
