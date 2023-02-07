import { Avatar, Button, Flex, Text } from "@chakra-ui/react";
import { ReactNode } from "react";

export const ContactButton = ({
  name,
  avatarUrl,
  onClick,
  isActive,
  detail,
}: {
  name: string;
  avatarUrl?: string;
  onClick?: VoidFunction;
  isActive?: boolean;
  detail?: ReactNode;
}) => {
  return (
    <Button
      variant={"ghost"}
      isActive={isActive}
      onClick={onClick}
      width={"full"}
      justifyContent={"start"}
      height={"auto"}
      textAlign={"left"}
    >
      <Flex gap={2} alignItems={"center"} py={2} flexGrow={1} overflow={"hidden"}>
        <Avatar size={detail ? "md" : "sm"} src={avatarUrl} />
        <Flex
          sx={{
            overflow: "hidden",
            flexDirection: "column",
            gap: 1,
            my: 2,
            flexGrow: 1,
          }}
        >
          <Text fontWeight={500} overflow={"hidden"} textOverflow={"ellipsis"}>
            {name}
          </Text>
          {detail}
        </Flex>
      </Flex>
    </Button>
  );
};
