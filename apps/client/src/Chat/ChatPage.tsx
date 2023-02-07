import { Divider, Flex, Text } from "@chakra-ui/react";
import { Outlet, Route, Routes } from "react-router-dom";
import { Contacts } from "./Contacts/Contacts";
import { Conversation } from "./Conversation";
import { NewConversation } from "./Conversation/NewConversation";
import { useConversationSubscription } from "./useConversationSubscription";
import { useMessageSubscription } from "./useMessageSubscription";

export const ChatPage = () => {
  useMessageSubscription();
  useConversationSubscription();

  return (
    <Routes>
      <Route
        element={
          <Flex h={"full"} w={"full"}>
            <Flex minWidth={360} maxWidth={360} h={"full"}>
              <Contacts />
            </Flex>
            <Divider orientation={"vertical"} />
            <Flex flexGrow={1} overflow={"hidden"} direction={"column"} h={"100%"}>
              <Outlet />
            </Flex>
          </Flex>
        }
      >
        <Route
          index
          element={
            <Flex h={"full"} w={"full"}>
              <Text m={"auto"} fontWeight={"bold"} fontSize={"lg"}>
                Select conversation to start chatting
              </Text>
            </Flex>
          }
        />
        <Route path="new" element={<NewConversation />} />
        <Route path=":conversationId" element={<Conversation />} />
      </Route>
    </Routes>
  );
};
