import { Flex } from "@chakra-ui/react";
import { forwardRef, PropsWithChildren, UIEventHandler } from "react";

type MessagesContainerProps = PropsWithChildren<{ onScroll: UIEventHandler<HTMLDivElement> }>;

export const MessagesContainer = forwardRef<HTMLDivElement, MessagesContainerProps>((props, ref) => {
  return (
    <Flex
      ref={ref}
      direction={"column-reverse"}
      align={"center"}
      gap={1}
      overflow={"auto"}
      p={4}
      h={"full"}
      onScroll={props.onScroll}
    >
      {props.children}
    </Flex>
  );
});
