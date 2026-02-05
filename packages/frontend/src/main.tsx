import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ApolloProvider } from '@apollo/client/react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { apolloClient } from './lib/apollo';
import { router } from './router';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ApolloProvider client={apolloClient}>
        <RouterProvider router={router} />
      </ApolloProvider>
    </ThemeProvider>
  </StrictMode>
);
