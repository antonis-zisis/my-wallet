import { ApolloClient, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { MockLink } from '@apollo/client/testing';
import { ReactNode } from 'react';

interface MockedProviderProps {
  mocks?: Array<MockLink.MockedResponse>;
  children: ReactNode;
}

export function MockedProvider({ mocks = [], children }: MockedProviderProps) {
  const mockLink = new MockLink(mocks);

  const client = new ApolloClient({
    link: mockLink,
    cache: new InMemoryCache(),
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
