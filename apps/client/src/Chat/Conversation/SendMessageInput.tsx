import { gql, useMutation } from "@apollo/client";
import { Flex, IconButton, Input } from "@chakra-ui/react";
import cuid from "cuid";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { MdSend as SendIcon } from "react-icons/md";
import { useSession } from "../../Auth";
import { graphql } from "../../generated/gql";
import { MessagesResponse, MessageStatus } from "../../generated/gql/graphql";

const SendMessageMutation = graphql(/*GraphQL*/ `
  mutation Mutation($conversationId: ID!, $message: String!) {
    sendMessage(conversationId: $conversationId, message: $message) {
      id
      body
      status
      timestamp
      sender {
        id
      }
    }
  }
`);

type MessageForm = { message: string };

export const SendMessageInput = (props: { conversationId: string; onSend: VoidFunction }) => {
  const { conversationId, onSend } = props;
  const { userId } = useSession();
  const { register, handleSubmit, reset, watch } = useForm<MessageForm>({
    defaultValues: { message: "" },
  });
  const { ref: messageFieldRef, ...messageFieldProps } = register("message", { required: true });

  const message = watch("message");
  const [sendMessage] = useMutation(SendMessageMutation, {
    variables: { message, conversationId },
    optimisticResponse: {
      sendMessage: {
        __typename: "Message",
        id: cuid(),
        body: message,
        status: MessageStatus.Sending,
        timestamp: new Date().toISOString(),
        sender: { id: userId },
      },
    },
    update: (cache, result) => {
      const id = `Conversation:${conversationId}`;
      const fragment = gql`
        fragment MessagesCache on Conversation {
          messages(limit: 1, offset: 0) {
            items {
              id
              status
              timestamp
              body
              sender {
                id
              }
            }
          }
        }
      `;
      const existing = cache.readFragment<{ messages: MessagesResponse }>({ id, fragment });
      cache.writeFragment({
        id,
        fragment,
        data: {
          messages: { items: [result.data?.sendMessage, ...(existing?.messages.items ?? [])].filter(Boolean) },
        },
      });
    },
  });

  const onSubmit: SubmitHandler<MessageForm> = () => {
    sendMessage();
    onSend();
    reset();
  };

  const [inputRef, setInputRef] = useState<HTMLInputElement>();
  useEffect(() => {
    inputRef?.focus();
  }, [inputRef]);

  return (
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
  );
};
