import { useMutation, useQuery } from "@apollo/client";
import { Avatar, Flex, IconButton, Input, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { MdSend as SendIcon } from "react-icons/md";
import { useNavigate, useSearchParams } from "react-router-dom";
import { graphql } from "../../generated/gql";
import { ConversationHeader } from "./ConversationHeader";
import { MessagesContainer } from "./MessagesContainer";

const START_CONVERSATION = graphql(/*GraphQL*/ `
  mutation StartConversationMutation($recipientId: ID!, $message: String!) {
    startConversation(recipientId: $recipientId, message: $message) {
      id
      participants {
        id
        email
      }
      messages(limit: 1, offset: 0) {
        items {
          id
          sender {
            id
            email
          }
          conversationId
          timestamp
          body
          status
        }
      }
    }
  }
`);

const USER_DETAIL = graphql(/*GraphQL*/ `
  query UserDetail($id: ID!) {
    user(id: $id) {
      id
      email
    }
  }
`);

type MessageForm = { message: string };

export const NewConversation = () => {
  const [searchParams] = useSearchParams();
  const recipientId = searchParams.get("userId");
  if (!recipientId) {
    throw new Error("userId searchParam is required in NewConversation");
  }

  const { data: userData, loading } = useQuery(USER_DETAIL, { variables: { id: recipientId } });
  const { register, handleSubmit, watch } = useForm<MessageForm>({
    defaultValues: { message: "" },
  });
  const { ref: messageFieldRef, ...messageFieldProps } = register("message", { required: true });
  const message = watch("message");
  const navigate = useNavigate();
  const [startConversation] = useMutation(START_CONVERSATION, {
    onCompleted: (data) => {
      navigate(`../${data?.startConversation?.id}` ?? "");
    },
  });

  const onSubmit: SubmitHandler<MessageForm> = ({ message }) => {
    startConversation({ variables: { message, recipientId } });
  };

  const [inputRef, setInputRef] = useState<HTMLInputElement>();
  useEffect(() => {
    inputRef?.focus();
  }, [inputRef]);

  return (
    <Flex direction="column" h={"100%"}>
      {loading ? (
        <ConversationHeader.Skeleton />
      ) : (
        <Flex p={3} boxShadow={"sm"} alignItems={"center"} gap={2}>
          <Avatar size={"sm"} />
          <Text fontWeight={500}>{userData?.user?.email ?? "Chat user"}</Text>
        </Flex>
      )}
      <MessagesContainer onScroll={() => {}}>
        <Text>Send your first message!</Text>
      </MessagesContainer>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex p={2} gap={2}>
          <Input
            variant={"filled"}
            placeholder="Aa"
            autoComplete="off"
            _focusVisible={{ outline: "none" }}
            ref={(element) => {
              messageFieldRef(element);
              element && setInputRef(element);
            }}
            {...messageFieldProps}
          />
          <IconButton
            type="submit"
            isDisabled={message.length === 0}
            icon={<SendIcon />}
            aria-label="Send message"
            color="purple"
            variant={"ghost"}
            _disabled={{ color: "gray.400", cursor: "default" }}
          />
        </Flex>
      </form>
    </Flex>
  );
};
