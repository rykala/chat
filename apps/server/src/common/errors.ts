import { ApolloServerErrorCode } from "@apollo/server/errors";
import { GraphQLError } from "graphql";

export class UnauthorizedGraphQLError extends GraphQLError {
  constructor() {
    super("Unauthorized access", { extensions: { code: "UNAUTHORIZED" } });
  }
}

export class InternalServerGraphQLError extends GraphQLError {
  constructor() {
    super("Internal server error", { extensions: { code: ApolloServerErrorCode.INTERNAL_SERVER_ERROR } });
  }
}
