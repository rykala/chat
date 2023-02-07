import { Box, Flex, Skeleton, SkeletonCircle } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../../Auth";
import { formatDistanceToNowStrict } from "../../common/utils";
import { FragmentType, getFragmentData, graphql } from "../../generated/gql";
import { ContactButton } from "./ContactButton";

const ContactItem_Message = graphql(/*GraphQL*/ `
  fragment ContactItem_Message on Message {
    id
    timestamp
    body
    sender {
      id
    }
  }
`);

type ContactItemProps = {
  name: string;
  avatarUrl?: string;
  conversationId: string;
  onClick?: VoidFunction;
  message: FragmentType<typeof ContactItem_Message>;
  isActive?: boolean;
};

export const ContactItem = (props: ContactItemProps) => {
  const { userId } = useSession();
  const { name, conversationId, onClick, isActive } = props;
  const { body, sender, timestamp } = getFragmentData(ContactItem_Message, props.message);
  const navigate = useNavigate();
  return (
    <ContactButton
      isActive={isActive}
      name={name}
      avatarUrl={props.avatarUrl}
      onClick={() => {
        onClick?.();
        navigate(conversationId);
      }}
      detail={
        <Flex sx={{ fontSize: "xs", fontWeight: 400, color: "gray.600", flexGrow: 1, gap: 0.5 }}>
          <Box overflow={"hidden"} textOverflow={"ellipsis"}>
            {sender.id === userId && "Me: "}
            {body ?? "No messages"}
          </Box>
          <span aria-hidden="true">·</span>
          <span>{formatDistanceToNowStrict(new Date(timestamp))}</span>
        </Flex>
      }
    />
  );
};

export const ContactItemSkeleton = () => (
  <Flex gap={3} alignItems={"center"}>
    <SkeletonCircle size="10" />
    <Flex direction={"column"} gap={2}>
      <Skeleton w={150} h={5} rounded={"xl"} />
      <Skeleton w={250} h={4} rounded={"xl"} />
    </Flex>
  </Flex>
);
