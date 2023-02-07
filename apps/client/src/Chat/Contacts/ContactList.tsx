import { useQuery } from "@apollo/client";
import { Flex, List, ListItem, Spinner, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { graphql } from "../../generated/gql";
import { ContactButton } from "./ContactButton";

type ContactListProps = {
  onContactSelect: VoidFunction;
  search: string;
};

const ViewerContactsQuery = graphql(/* GraphQL */ `
  query ViewerContacts($limit: Int = 50, $offset: Int = 0, $search: String!) {
    viewer {
      contacts(limit: $limit, offset: $offset, search: $search) {
        items {
          conversationId
          user {
            id
            email
            avatarUrl
          }
        }
      }
    }
  }
`);

export const ContactList = ({ onContactSelect, search }: ContactListProps) => {
  const navigate = useNavigate();
  const { data, loading } = useQuery(ViewerContactsQuery, { variables: { search } });
  const contacts = data?.viewer?.contacts.items ?? [];

  if (loading) {
    return (
      <Flex w={"full"}>
        <Spinner mx={"auto"} mt={4} />
      </Flex>
    );
  }
  if (!loading && contacts.length === 0) {
    return (
      <Text textAlign={"center"} w={"full"} mt={4}>
        {search === "" ? "Start typing to find users" : "No user found"}
      </Text>
    );
  }

  return (
    <List>
      {contacts.map(({ user: { id, email, avatarUrl }, conversationId }) => {
        return (
          <ListItem key={id} overflow={"hidden"}>
            <ContactButton
              name={email}
              avatarUrl={avatarUrl ?? undefined}
              onClick={() => {
                navigate(conversationId ? conversationId : `new?userId=${id}`);
                onContactSelect();
              }}
            />
          </ListItem>
        );
      })}
    </List>
  );
};
