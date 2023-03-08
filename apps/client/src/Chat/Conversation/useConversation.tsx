import { NetworkStatus, useQuery } from "@apollo/client";
import { isNonEmptyArray } from "@apollo/client/utilities";
import { isNonNullObject } from "@apollo/client/utilities/common/objects";
import { RefObject, UIEventHandler } from "react";
import { useParams } from "react-router-dom";
import { useSession } from "../../Auth";
import { graphql } from "../../generated/gql";

const ConversationQuery = graphql(/* GraphQL */ `
  query ConversationQuery($conversationId: ID!, $messagesLimit: Int = 50, $messagesOffset: Int = 0) {
    conversation(conversationId: $conversationId) {
      id
      ...ConversationHeader_Conversation
      messages(limit: $messagesLimit, offset: $messagesOffset) {
        items {
          id
          sender {
            id
          }
          ...MessageItem_Message
        }
        hasMore
      }
    }
  }
`);

export const useConversation = (messagesContainerRef: RefObject<HTMLDivElement>) => {
  const { conversationId } = useParams();
  const { userId } = useSession();
  if (!conversationId) {
    throw new Error("missing params: conversationId in useConversation");
  }
  const { data, fetchMore, loading, networkStatus } = useQuery(ConversationQuery, {
    variables: { conversationId },
    notifyOnNetworkStatusChange: true,
  });
  const fetchingMore = networkStatus === NetworkStatus.fetchMore;
  const loadingMessages = loading;
  const noMessages = !loading && !fetchingMore && !isNonEmptyArray(data?.conversation?.messages.items);
  const messagesReady = isNonEmptyArray(data?.conversation?.messages.items);
  const conversationReady = isNonNullObject(data?.conversation);

  const handleMessagesScrollToTop: UIEventHandler<HTMLDivElement> = (event) => {
    const {
      currentTarget: { scrollTop, clientHeight, scrollHeight },
    } = event;
    const realHeight = scrollHeight - clientHeight;
    const isTop = -scrollTop === realHeight;
    if (isTop && !loadingMessages && data?.conversation?.messages.hasMore) {
      fetchMore({ variables: { messagesOffset: data!.conversation!.messages.items.length } });
    }
  };

  const scrollMessagesToBottom = () => messagesContainerRef.current?.scrollTo({ top: 0 });

  return {
    conversationId,
    userId,
    data,
    conversationReady,
    loadingMessages,
    noMessages,
    messagesReady,
    handleMessagesScrollToTop,
    scrollMessagesToBottom,
  };
};
