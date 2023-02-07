import { useApolloClient, useMutation } from "@apollo/client";
import { Flex, IconButton, Tooltip } from "@chakra-ui/react";
import { BsChatSquareFill } from "react-icons/bs";
import { FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { graphql } from "../../generated/gql";
import { routes } from "../../routes";

const LOGOUT_MUTATION = graphql(/*GraphQL*/ `
  mutation Logout {
    logout
  }
`);

export const Sidebar = () => {
  const client = useApolloClient();
  const navigate = useNavigate();

  const [logout] = useMutation(LOGOUT_MUTATION, {
    onCompleted: async () => {
      await client.resetStore();
      navigate(routes.LOGIN);
    },
  });
  return (
    <Flex py={4} px={2} direction="column" h={"100%"}>
      <Tooltip label="Chats">
        <IconButton mb={"auto"} icon={<BsChatSquareFill />} aria-label="Chats" variant={"solid"} colorScheme="purple" />
      </Tooltip>

      <Tooltip label="Sign Out">
        <IconButton onClick={() => logout()} mt={"auto"} icon={<FaSignOutAlt />} aria-label="Sign Out" />
      </Tooltip>
    </Flex>
  );
};
