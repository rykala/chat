import { GraphQLError } from "graphql";
import { allow, rule, shield } from "graphql-shield";
import { MyContext } from "../types";
import { InternalServerGraphQLError, UnauthorizedGraphQLError } from "./errors";

const isAuthenticated = rule()(async (_, __, { userId }: MyContext) => {
  if (!userId) {
    return new UnauthorizedGraphQLError();
  }
  return true;
});

export const createPermissions = () =>
  shield(
    {
      Mutation: { login: allow, register: allow },
      LoginSuccess: allow,
      LoginProblem: allow,
      InvalidInput: allow,
      Session: allow,
    },
    {
      fallbackRule: isAuthenticated,
      async fallbackError(error) {
        if (error instanceof GraphQLError) {
          return error;
        }
        if (error instanceof Error) {
          console.error(error);
          return new InternalServerGraphQLError();
        }
        console.error("The resolver threw something that is not an error:", error);
        return new InternalServerGraphQLError();
      },
    },
  );
