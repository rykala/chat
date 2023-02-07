import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client";
import { FieldPolicy } from "@apollo/client/cache/inmemory/policies";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient as createWsClient } from "graphql-ws";

const httpLink = new HttpLink({
  uri: `${import.meta.env.VITE_SERVER_URL}/graphql`,
});

const wsLink = new GraphQLWsLink(
  createWsClient({
    url: `ws://localhost:8000/graphql`,
  }),
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === "OperationDefinition" && definition.operation === "subscription";
  },
  wsLink,
  httpLink,
);

export const createClient = () =>
  new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache({
      typePolicies: {
        Viewer: {
          merge: true,
          fields: {
            conversations: customOffsetLimitPagination(),
            contacts: customOffsetLimitPagination(["search"]),
          },
        },
        Conversation: {
          fields: {
            messages: customOffsetLimitPagination(),
          },
        },
      },
    }),
  });

const customOffsetLimitPagination = <T extends { items: unknown[] }>(
  keyArgs?: FieldPolicy["keyArgs"],
): FieldPolicy<T> => ({
  keyArgs: keyArgs ?? false,
  merge(existing, incoming, { args }) {
    if (!existing) {
      return incoming;
    }
    const mergedItems = existing.items.slice(0, args!.offset);
    const items = mergedItems.concat(incoming.items);
    return { ...existing, ...incoming, items };
  },
});
