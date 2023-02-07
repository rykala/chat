import { Grid, Spinner } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import { SessionContextProvider } from "../../Auth";
import { Layout } from "./Layout";
import { Sidebar } from "./Sidebar";

export const PrivateApp = () => {
  return (
    <SessionContextProvider
      loadingPage={
        <Grid
          h="100vh"
          alignItems={"center"}
          justifyContent={"center"}
          bgGradient="radial-gradient(circle at 0% 0%, pink.700 0%, purple.500 40%)"
        >
          <Spinner color="white" size={"xl"} />
        </Grid>
      }
    >
      <Layout sidebar={<Sidebar />}>
        <Outlet />
      </Layout>
    </SessionContextProvider>
  );
};
