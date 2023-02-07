import { gql, useSubscription } from "@apollo/client";
import { graphql } from "../generated/gql";
import { Message } from "../generated/gql/graphql";

export const MessageCreatedSubscription = graphql(/*GraphQL*/ `
  subscription onMessageCreated {
    onMessageCreated {
      id
      body
      timestamp
      status
      conversationId
      sender {
        id
      }
    }
  }
`);

export const useMessageSubscription = () => {
  useSubscription(MessageCreatedSubscription, {
    onData: ({ client: { cache }, data }) => {
      const { conversationId, ...message } = data.data!.onMessageCreated;
      const id = `Conversation:${conversationId}`;
      const fragment = gql`
        fragment MessagesCache_Conversation on Conversation {
          messages(limit: 1, offset: 0) {
            items {
              id
              status
              timestamp
              body
              sender {
                id
              }
            }
          }
        }
      `;
      const existing = cache.readFragment<{ messages: { items: Message[] } }>({ id, fragment });
      cache.writeFragment({
        id,
        fragment,
        data: {
          messages: {
            ...existing?.messages,
            items: [message, ...(existing?.messages.items ?? [])].filter(Boolean),
          },
        },
      });
    },
  });
};
