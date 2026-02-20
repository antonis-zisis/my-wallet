import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { NavBar } from './NavBar';

const renderNavBar = async () => {
  render(
    <ThemeProvider>
      <AuthProvider>
        <MemoryRouter>
          <NavBar />
        </MemoryRouter>
      </AuthProvider>
    </ThemeProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
};

describe('NavBar', () => {
  it('renders Dashboard link', async () => {
    await renderNavBar();
    const link = screen.getByText('Dashboard');
    expect(link.closest('a')).toHaveAttribute('href', '/');
  });

  it('renders Reports link', async () => {
    await renderNavBar();
    const link = screen.getByText('Reports');
    expect(link.closest('a')).toHaveAttribute('href', '/reports');
  });

  it('renders Subscriptions link', async () => {
    await renderNavBar();
    const link = screen.getByText('Subscriptions');
    expect(link.closest('a')).toHaveAttribute('href', '/subscriptions');
  });

  it('renders Net Worth link', async () => {
    await renderNavBar();
    const link = screen.getByText('Net Worth');
    expect(link.closest('a')).toHaveAttribute('href', '/net-worth');
  });

  it('contains theme toggle', async () => {
    await renderNavBar();
    expect(screen.getByLabelText(/Switch to .+ mode/)).toBeInTheDocument();
  });

  it('renders Log out button', async () => {
    await renderNavBar();
    expect(screen.getByText('Log out')).toBeInTheDocument();
  });
});
