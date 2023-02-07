import { useQuery } from "@apollo/client";
import { createContext, PropsWithChildren, ReactNode, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { graphql } from "../generated/gql";
import { Session } from "../generated/gql/graphql";
import { routes } from "../routes";

const AUTH_CHECK_QUERY = graphql(/* GraphQL */ `
  query AuthCheck {
    authCheck {
      userId
    }
  }
`);

type SessionContextType = Omit<Session, "__typename">;

const SessionContext = createContext<SessionContextType>(undefined!);

export const SessionContextProvider = ({ children, loadingPage }: PropsWithChildren<{ loadingPage: ReactNode }>) => {
  const navigate = useNavigate();

  const { loading, data } = useQuery(AUTH_CHECK_QUERY, {
    onError: (error) => {
      console.log(error);
      navigate(routes.LOGIN, { state: { from: location } });
    },
  });

  if (loading || !data?.authCheck) {
    return <>{loadingPage}</>;
  }
  return <SessionContext.Provider value={data.authCheck}>{children}</SessionContext.Provider>;
};

export const useSession = () => useContext(SessionContext);
