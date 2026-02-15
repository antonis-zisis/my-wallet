import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';

import { supabase } from './supabase';

const httpLink = new HttpLink({
  uri: '/graphql',
});

const authLink = new SetContextLink(async ({ headers }, _operation) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
