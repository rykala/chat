import { offsetPaginationSchema } from "../common/validations";
import { DatabaseClient } from "../types";

export const generateConversationModel = ({ db }: { db: DatabaseClient }) => ({
  async create({ message, recipientId, senderId }: { message: string; recipientId: string; senderId: string }) {
    const existingConversation = await db.conversation.findFirst({
      where: { participants: { every: { id: { in: [recipientId, senderId] } } } },
    });
    if (existingConversation) {
      throw new Error("Conversation already exists");
    }
    return db.conversation.create({
      data: {
        messages: { create: [{ sender: { connect: { id: senderId } }, body: message }] },
        participants: { connect: [{ id: senderId }, { id: recipientId }] },
      },
    });
  },

  async getById(id: string) {
    const conversation = await db.conversation.findUnique({ where: { id } });
    return conversation;
  },

  async getParticipants(conversationId: string, userId: string) {
    const participants = await db.conversation
      .findUnique({ where: { id: conversationId } })
      .participants({ where: { id: { not: userId } } });
    return participants ?? [];
  },

  async getAllByUserId({ userId, offset, limit }: { userId: string; offset: number; limit: number }) {
    offsetPaginationSchema.parse({ offset, limit });

    const [conversations, totalCount] = await db.$transaction([
      db.conversation.findMany({
        select: { id: true },
        where: { participants: { some: { id: userId } } },
        orderBy: { lastUpdated: "desc" },
        take: limit,
        skip: offset,
      }),
      db.conversation.count({ where: { participants: { some: { id: userId } } } }),
    ]);
    return { items: conversations, hasMore: conversations.length < totalCount };
  },

  async getMessages({ conversationId, offset, limit }: { conversationId: string; offset: number; limit: number }) {
    offsetPaginationSchema.parse({ offset, limit });

    const [messages, totalCount] = await db.$transaction([
      db.conversation
        .findUnique({ where: { id: conversationId } })
        .messages({ orderBy: { timestamp: "desc" }, take: limit, skip: offset }),
      db.message.count({ where: { conversationId } }),
    ]);
    const items = messages ?? [];
    return { items, hasMore: items.length + offset < totalCount };
  },

  async getConversationIdByUserIds(ids: string[]) {
    const conversation = await db.conversation.findFirst({ where: { participants: { every: { id: { in: ids } } } } });
    return conversation?.id ?? null;
  },
});
