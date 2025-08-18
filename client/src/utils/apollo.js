import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { nhost } from './nhost';

export const createApolloClient = (accessToken) => {
  const httpLink = new HttpLink({
    uri: nhost.graphql.httpUrl,
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const wsLink = new GraphQLWsLink(
    createClient({
      url: nhost.graphql.wsUrl,
      connectionParams: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    })
  );

  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    httpLink
  );

  return new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
  });
};
