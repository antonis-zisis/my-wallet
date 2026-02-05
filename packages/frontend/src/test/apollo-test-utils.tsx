import { ReactNode } from 'react';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { MockLink, MockedResponse } from '@apollo/client/testing';

export type { MockedResponse };

interface MockedProviderProps {
  mocks?: MockedResponse[];
  addTypename?: boolean;
  children: ReactNode;
}

export function MockedProvider({
  mocks = [],
  addTypename = true,
  children,
}: MockedProviderProps) {
  const mockLink = new MockLink(mocks, addTypename);

  const client = new ApolloClient({
    link: mockLink,
    cache: new InMemoryCache({ addTypename }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'no-cache',
      },
      query: {
        fetchPolicy: 'no-cache',
      },
    },
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
