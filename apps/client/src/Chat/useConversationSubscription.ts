import { useSubscription } from "@apollo/client";
import { getFragmentData, graphql } from "../generated/gql";
import { Viewer } from "../generated/gql/graphql";

const CONVERSATION_FRAGMENT = graphql(/*GraphQL*/ `
  fragment ConversationFields on Conversation {
    id
    participants {
      id
      email
    }
    messages(offset: 0, limit: 1) {
      items {
        id
        body
        timestamp
        status
        sender {
          id
          email
        }
      }
    }
  }
`);

const ON_CONVERSATION_CREATED = graphql(/*GraphQL*/ `
  subscription OnConversationCreated {
    onConversationCreated {
      conversation {
        ...ConversationFields
      }
      startedBy
    }
  }
`);

export const useConversationSubscription = () => {
  useSubscription(ON_CONVERSATION_CREATED, {
    onData: ({ data, client: { cache } }) => {
      if (!data.data) {
        return;
      }

      const conversation = getFragmentData(CONVERSATION_FRAGMENT, data.data.onConversationCreated.conversation);
      cache.modify({
        fields: {
          viewer(existingViewerData: Viewer = {} as Viewer) {
            const existingConversations = existingViewerData.conversations?.items ?? [];

            const newConversationRef = cache.writeFragment({
              fragment: CONVERSATION_FRAGMENT,
              data: conversation,
            });

            return {
              ...existingViewerData,
              conversations: {
                ...existingViewerData.conversations,
                items: [newConversationRef, ...existingConversations],
              },
            } as Viewer;
          },
        },
      });
    },
  });
};
