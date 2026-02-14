import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { NavBar } from './NavBar';

const renderNavBar = () => {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <MemoryRouter>
          <NavBar />
        </MemoryRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

describe('NavBar', () => {
  it('renders Dashboard link', () => {
    renderNavBar();
    const link = screen.getByText('Dashboard');
    expect(link.closest('a')).toHaveAttribute('href', '/');
  });

  it('renders Reports link', () => {
    renderNavBar();
    const link = screen.getByText('Reports');
    expect(link.closest('a')).toHaveAttribute('href', '/reports');
  });

  it('renders Net Worth link', () => {
    renderNavBar();
    const link = screen.getByText('Net Worth');
    expect(link.closest('a')).toHaveAttribute('href', '/net-worth');
  });

  it('contains theme toggle', () => {
    renderNavBar();
    expect(screen.getByLabelText(/Switch to .+ mode/)).toBeInTheDocument();
  });

  it('renders Log out button', () => {
    renderNavBar();
    expect(screen.getByText('Log out')).toBeInTheDocument();
  });
});
