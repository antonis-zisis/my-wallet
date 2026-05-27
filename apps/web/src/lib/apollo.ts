import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';

import { supabase } from './supabase';

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL || '/graphql',
  fetch: async (uri, options) => {
    const response = await fetch(uri, options);
    if (response.status === 401) {
      try {
        const body = await response.clone().json();
        if (typeof body?.error === 'string') {
          await supabase.auth.signOut();
        }
      } catch {
        // Non-JSON 401 (e.g. from a proxy) — do not sign out
      }
    }
    return response;
  },
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
