import type { Message } from "database";
import { DatabaseClient } from "../types";

export const generateMessageModel = ({ db }: { db: DatabaseClient }) => ({
  async send(message: Pick<Message, "conversationId" | "body" | "senderId">) {
    const [newMessage] = await db.$transaction([
      db.message.create({
        data: {
          body: message.body,
          sender: { connect: { id: message.senderId } },
          conversation: { connect: { id: message.conversationId } },
        },
      }),
      db.conversation.update({
        where: { id: message.conversationId },
        data: { lastUpdated: new Date() },
      }),
    ]);

    return newMessage;
  },

  async getSender(messageId: string) {
    const sender = await db.message
      .findUniqueOrThrow({ where: { id: messageId } })
      .sender({ select: { id: true, email: true, avatarUrl: true } });
    return sender;
  },
});
