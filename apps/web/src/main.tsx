import './index.css';

import { ApolloProvider } from '@apollo/client/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';

import { AuthProvider } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { PrivacyProvider } from './contexts/PrivacyContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { UserProvider } from './contexts/UserContext';
import { apolloClient } from './lib/apollo';
import { router } from './router';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <PrivacyProvider>
        <ToastProvider>
          <AuthProvider>
            <ApolloProvider client={apolloClient}>
              <UserProvider>
                <CurrencyProvider>
                  <RouterProvider router={router} />
                </CurrencyProvider>
              </UserProvider>
            </ApolloProvider>
          </AuthProvider>
        </ToastProvider>
      </PrivacyProvider>
    </ThemeProvider>
  </StrictMode>
);
