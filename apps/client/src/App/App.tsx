import { ApolloProvider } from "@apollo/client";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage, RegisterPage } from "../Auth";
import { ChatPage } from "../Chat";
import { createClient } from "../common/client";
import { routes } from "../routes";
import { PrivateApp } from "./PrivateApp/PrivateApp";

const client = createClient();

export const App = () => {
  return (
    <ChakraProvider>
      <BrowserRouter>
        <ApolloProvider client={client}>
          <Routes>
            <Route index element={<Navigate to={routes.CHAT} replace />} />
            <Route element={<PrivateApp />}>
              <Route path={`${routes.CHAT}/*`} element={<ChatPage />} />
            </Route>
            <Route path={routes.LOGIN} element={<LoginPage />} />
            <Route path={routes.REGISTER} element={<RegisterPage />} />
          </Routes>
        </ApolloProvider>
      </BrowserRouter>
    </ChakraProvider>
  );
};
