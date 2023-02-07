import { useQuery } from "@apollo/client";
import { Flex, List, ListItem } from "@chakra-ui/react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { getConversationName, sortByLastMessageTimestamp } from "../../common/utils";
import { graphql } from "../../generated/gql";
import { MessageCreatedSubscription } from "../useMessageSubscription";
import { ContactItem, ContactItemSkeleton } from "./ContactItem";

export const ViewerConversationsQuery = graphql(/* GraphQL */ `
  query ViewerConversations($conversationsOffset: Int = 0, $conversationsLimit: Int = 50) {
    viewer {
      conversations(offset: $conversationsOffset, limit: $conversationsLimit) {
        items {
          id
          participants {
            id
            email
            avatarUrl
          }
          messages(offset: 0, limit: 1) {
            items {
              ...ContactItem_Message
              timestamp
            }
          }
        }
      }
    }
  }
`);

export const ConversationList = () => {
  const { conversationId } = useParams();
  const { data, loading, subscribeToMore } = useQuery(ViewerConversationsQuery);

  useEffect(() => {
    subscribeToMore({
      document: MessageCreatedSubscription,
      updateQuery: (prev, { subscriptionData }) => {
        console.log("PREV", prev);
        console.log("new", subscriptionData);
        return prev;
      },
    });
  }, []);

  const conversations = data?.viewer ? [...data.viewer.conversations.items].sort(sortByLastMessageTimestamp) : [];

  if (loading) {
    return (
      <Flex direction={"column"} gap={5}>
        <ContactItemSkeleton />
        <ContactItemSkeleton />
        <ContactItemSkeleton />
      </Flex>
    );
  }

  if (conversations.length === 0) {
    return <>No conversations</>;
  }

  return (
    <List>
      {conversations.map(
        ({
          id,
          messages: {
            items: [lastMessage],
          },
          participants,
        }) => {
          if (!lastMessage) {
            return null;
          }
          return (
            <ListItem key={id} overflow={"hidden"}>
              <ContactItem
                conversationId={id}
                name={getConversationName(participants)}
                avatarUrl={participants[0].avatarUrl ?? undefined}
                isActive={conversationId === id}
                message={lastMessage}
              />
            </ListItem>
          );
        },
      )}
    </List>
  );
};
