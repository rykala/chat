import { GraphQLError } from "graphql";

export const AuthenticationError = () => {
  const ERROR_MESSAGE = "*** you must be logged in ***";
  return new GraphQLError(ERROR_MESSAGE, { extensions: { code: "UNAUTHENTICATED" } });
};

export const ForbiddenError = (message: GraphQLError["message"]) => {
  return new GraphQLError(message, { extensions: { code: "FORBIDDEN" } });
};
