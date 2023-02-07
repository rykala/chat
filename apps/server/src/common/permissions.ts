import { allow, rule, shield } from "graphql-shield";
import { MyContext } from "../types";

const isAuthenticated = rule()(async (_, __, { userId }: MyContext) => !!userId);

export const createPermissions = () =>
  shield({ Mutation: { login: allow, register: allow } }, { fallbackRule: allow });
