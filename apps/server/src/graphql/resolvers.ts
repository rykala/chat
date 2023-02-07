import { withFilter } from "graphql-subscriptions";
import { Subscription } from "../common";
import { pubsub } from "../common";
import { MyContext, Resolvers } from "../types";

export const resolvers: Resolvers = {
  Query: {
    viewer: () => ({}),
    authCheck: (_, __, { userId }) => ({ userId: userId! }),
    conversation: (_, { conversationId: id }, { models: { Conversation } }) => Conversation.getById(id),
    user: (_, { id }, { models: { User } }) => User.getById(id),
  },

  Viewer: {
    user: (_, __, { models: { Auth } }) => Auth.currentUser(),
    conversations: (_, { limit, offset }, { models: { Conversation }, userId }) =>
      Conversation.getAllByUserId({ userId: userId!, limit, offset }),
    contacts: (_, { limit, offset, search }, { models: { User }, userId }) =>
      User.getAllContacts({ userId: userId!, limit, offset, search }),
  },

  Conversation: {
    messages: ({ id: conversationId }, { limit, offset }, { models: { Conversation } }) =>
      Conversation.getMessages({ conversationId: conversationId!, limit, offset }),
    participants: ({ id: conversationId }, _, { userId, models: { Conversation } }) =>
      Conversation.getParticipants(conversationId!, userId!),
  },

  Message: {
    sender: ({ id: messageId }, __, { models: { Message } }) => Message.getSender(messageId!),
  },

  Contact: {
    conversationId: ({ user }, _, { models: { Conversation }, userId }) =>
      Conversation.getConversationIdByUserIds([user!.id!, userId!]),
  },

  Mutation: {
    login: (_, { email, password }, { models: { Auth } }) => Auth.login({ email, password }),
    logout: (_, __, { models: { Auth } }) => Auth.logout(),
    register: (_, { email, password }, { models: { Auth } }) => Auth.register({ email, password }),
    sendMessage: async (_, { conversationId, message }, { models: { Message }, userId }) => {
      const newMessage = await Message.send({ senderId: userId!, conversationId, body: message });
      await pubsub.publish(Subscription.MESSAGE_CREATED, { onMessageCreated: newMessage });
      return newMessage;
    },
    startConversation: async (_, { message, recipientId }, { models: { Conversation }, userId }) => {
      const conversation = await Conversation.create({ message, recipientId, senderId: userId! });
      await pubsub.publish(Subscription.CONVERSATION_CREATED, {
        onConversationCreated: { conversation, startedBy: userId },
      });
      return conversation;
    },
  },

  RegisterResult: {
    __resolveType(obj) {
      if ("id" in obj) {
        return "RegisterSuccess";
      }
      if ("title" in obj) {
        return "RegisterProblem";
      }
      return null;
    },
  },

  LoginResult: {
    __resolveType(obj) {
      if ("session" in obj) {
        return "LoginSuccess";
      }
      if ("title" in obj) {
        return "LoginProblem";
      }
      return null;
    },
  },

  Subscription: {
    onMessageCreated: {
      //@ts-ignore
      subscribe: withFilter(
        () => pubsub.asyncIterator(Subscription.MESSAGE_CREATED),
        async ({ onMessageCreated }, _, { userId }: MyContext) => onMessageCreated.senderId !== userId!,
      ),
    },
    onConversationCreated: {
      //@ts-ignore
      subscribe: () => pubsub.asyncIterator(Subscription.CONVERSATION_CREATED),
    },
  },
};
