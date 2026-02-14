import './index.css';

import { ApolloProvider } from '@apollo/client/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { apolloClient } from './lib/apollo';
import { router } from './router';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <ApolloProvider client={apolloClient}>
          <RouterProvider router={router} />
        </ApolloProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
