import { Divider, Flex } from "@chakra-ui/react";
import { PropsWithChildren, ReactNode } from "react";

export const Layout = ({ children, sidebar }: PropsWithChildren<{ sidebar: ReactNode }>) => {
  return (
    <Flex direction={"row"} h={"100vh"} w={"full"} overflow={"hidden"}>
      {sidebar}
      <Divider orientation={"vertical"} />

      {children}
    </Flex>
  );
};
