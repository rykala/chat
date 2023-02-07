import { Flex, Icon, Spinner, Text, Tooltip } from "@chakra-ui/react";

import { formatRelative } from "date-fns";
import { enUS } from "date-fns/locale";
import { MdErrorOutline } from "react-icons/all";
import { FragmentType, getFragmentData, graphql } from "../../generated/gql";
import { MessageStatus } from "../../generated/gql/graphql";

type MessageProps = {
  message: FragmentType<typeof MessageItem_Message>;
  position?: "start" | "middle" | "end";
  type: "recipient" | "sender";
};

const formatRelativeLocale = {
  lastWeek: "eeee 'at' p",
  yesterday: "'Yesterday at' p",
  today: "p",
  other: "MM/dd/yy",
};

const MessageItem_Message = graphql(/*GraphQL*/ `
  fragment MessageItem_Message on Message {
    id
    body
    timestamp
    status
  }
`);

export const MessageItem = (props: MessageProps) => {
  const { type } = props;
  const { id, timestamp, body, status } = getFragmentData(MessageItem_Message, props.message);
  const date = formatRelative(new Date(timestamp), new Date(), {
    locale: {
      ...enUS,
      formatRelative: (token) => formatRelativeLocale[token as keyof typeof formatRelativeLocale],
    },
  });
  return (
    <Tooltip label={date} placement={"left"} openDelay={500}>
      <Flex
        align={"center"}
        gap={2}
        maxW={"3xl"}
        ml={type === "sender" ? "auto" : "initial"}
        mr={type === "recipient" ? "auto" : "initial"}
      >
        {status === MessageStatus.Sending && <Spinner size={"sm"} key={`${id}-loading`} />}
        {status === MessageStatus.Error && (
          <Tooltip label={"Error sending message!"}>
            <span>
              <Icon color={"red.500"} as={MdErrorOutline} key={`${id}-error`} />
            </span>
          </Tooltip>
        )}
        <Text
          key={id}
          fontSize={"sm"}
          sx={{
            maxW: "max",
            borderRadius: "3xl",
            p: 2,
            px: 3,
            bg: type === "sender" ? "purple.600" : "gray.200",
            color: type === "sender" ? "white" : "black",
          }}
        >
          {body}
        </Text>
      </Flex>
    </Tooltip>
  );
};

MessageItem.NoMessages = () => {
  return <Text my={2}>No messages</Text>;
};

MessageItem.LoadingMessages = () => {
  return (
    <Flex mt={2} mb={4}>
      <Spinner />
    </Flex>
  );
};
