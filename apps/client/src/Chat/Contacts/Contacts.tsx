import { Box, Flex, Heading, IconButton } from "@chakra-ui/react";
import { useState } from "react";
import { IoArrowBack } from "react-icons/all";
import { ContactList } from "./ContactList";
import { ConversationList } from "./ConversationList";
import { ContactsSearchInput } from "./ContactsSearchInput";

enum Tab {
  CONVERSATIONS,
  SEARCH,
}

export const Contacts = () => {
  const [tab, setTab] = useState(Tab.CONVERSATIONS);
  const resetSearch = () => {
    setSearch("");
    setTab(Tab.CONVERSATIONS);
  };
  const [search, setSearch] = useState("");

  return (
    <Flex width={"full"} direction={"column"} gap={3}>
      <Heading fontSize={"3xl"} pt={2} px={2}>
        Chats
      </Heading>
      <Flex alignItems={"center"} gap={1}>
        {tab === Tab.SEARCH && (
          <IconButton
            icon={<IoArrowBack />}
            variant="ghost"
            aria-label="Back to chats"
            onClick={() => setTab(Tab.CONVERSATIONS)}
          />
        )}
        <Box px={2} w={"full"}>
          <ContactsSearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onBlur={resetSearch}
            onFocus={() => setTab(Tab.SEARCH)}
          />
        </Box>
      </Flex>
      <Box overflow={"auto"} px={2} h={"full"}>
        {tab === Tab.CONVERSATIONS && <ConversationList />}
        {tab === Tab.SEARCH && <ContactList search={search} onContactSelect={resetSearch} />}
      </Box>
    </Flex>
  );
};
