import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeProvider, useTheme } from './ThemeContext';

function TestConsumer() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('defaults to light theme', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  it('toggles to dark theme', async () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    await userEvent.click(screen.getByText('Toggle'));
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  it('adds dark class to document element', async () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    await userEvent.click(screen.getByText('Toggle'));
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes dark class when toggled back to light', async () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    await userEvent.click(screen.getByText('Toggle'));
    await userEvent.click(screen.getByText('Toggle'));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('persists theme to localStorage', async () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    await userEvent.click(screen.getByText('Toggle'));
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('uses stored theme from localStorage', () => {
    localStorage.setItem('theme', 'dark');
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  it('throws when useTheme is used outside ThemeProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      'useTheme must be used within a ThemeProvider'
    );
    consoleSpy.mockRestore();
  });
});
