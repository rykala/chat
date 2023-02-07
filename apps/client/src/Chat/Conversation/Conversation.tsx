import { Flex } from "@chakra-ui/react";
import React, { useRef } from "react";
import { ConversationHeader } from "./ConversationHeader";
import { MessageItem } from "./MessageItem";
import { MessagesContainer } from "./MessagesContainer";
import { SendMessageInput } from "./SendMessageInput";
import { useConversation } from "./useConversation";

export const Conversation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    conversationId,
    userId,
    data,
    conversationReady,
    loadingMessages,
    noMessages,
    messagesReady,
    handleMessagesScrollToTop,
    scrollMessagesToBottom,
  } = useConversation(containerRef);
  return (
    <Flex direction="column" h={"100%"}>
      {conversationReady ? <ConversationHeader conversation={data!.conversation!} /> : <ConversationHeader.Skeleton />}

      <MessagesContainer onScroll={handleMessagesScrollToTop}>
        {messagesReady &&
          data!.conversation!.messages.items.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              type={userId === message.sender.id ? "sender" : "recipient"}
            />
          ))}
        {loadingMessages && <MessageItem.LoadingMessages />}
        {noMessages && <MessageItem.NoMessages />}
      </MessagesContainer>

      <SendMessageInput key={conversationId} conversationId={conversationId} onSend={scrollMessagesToBottom} />
    </Flex>
  );
};
