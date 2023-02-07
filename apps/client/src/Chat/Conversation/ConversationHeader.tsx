import { Avatar, Flex, Skeleton, SkeletonCircle, Text } from "@chakra-ui/react";
import React from "react";
import { getConversationName } from "../../common/utils";
import { FragmentType, getFragmentData, graphql } from "../../generated/gql";

const ConversationHeader_Conversation = graphql(/* GraphQL */ `
  fragment ConversationHeader_Conversation on Conversation {
    participants {
      id
      email
      avatarUrl
    }
  }
`);

type ConversationHeaderProps = {
  conversation: FragmentType<typeof ConversationHeader_Conversation>;
};

export const ConversationHeader = (props: ConversationHeaderProps) => {
  const { participants } = getFragmentData(ConversationHeader_Conversation, props.conversation);
  return (
    <Flex p={3} boxShadow={"sm"} alignItems={"center"} gap={2}>
      <Avatar size={"sm"} src={participants[0].avatarUrl ?? undefined} />
      <Text fontWeight={500}>{getConversationName(participants)}</Text>
    </Flex>
  );
};

ConversationHeader.Skeleton = () => {
  return (
    <Flex p={3} boxShadow={"sm"} alignItems={"center"} gap={2}>
      <SkeletonCircle size={"35"} /> <Skeleton height={6} width={250} />
    </Flex>
  );
};
