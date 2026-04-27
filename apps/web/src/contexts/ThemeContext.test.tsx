import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeProvider, useTheme } from './ThemeContext';

function TestConsumer() {
  const { resolvedTheme, setTheme, theme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved-theme">{resolvedTheme}</span>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('system')}>Set System</button>
    </div>
  );
}

function makeMatchMediaMock(initiallyDark: boolean) {
  const listeners: Array<(event: MediaQueryListEvent) => void> = [];

  const mediaQuery = {
    matches: initiallyDark,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: (
      _event: string,
      handler: EventListenerOrEventListenerObject
    ) => {
      listeners.push(handler as (event: MediaQueryListEvent) => void);
    },
    removeEventListener: (
      _event: string,
      handler: EventListenerOrEventListenerObject
    ) => {
      const index = listeners.indexOf(
        handler as (event: MediaQueryListEvent) => void
      );
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    },
    dispatchEvent: () => false,
  };

  const triggerChange = (dark: boolean) => {
    const event = { matches: dark } as MediaQueryListEvent;
    listeners.forEach((listener) => listener(event));
  };

  return { mediaQuery, triggerChange };
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('defaults to system theme when localStorage is empty', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme')).toHaveTextContent('system');
  });

  it('resolves system theme to light when OS is light', () => {
    // global matchMedia mock returns matches: false (light)
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('resolves system theme to dark when OS is dark', () => {
    const { mediaQuery } = makeMatchMediaMock(true);
    vi.spyOn(window, 'matchMedia').mockReturnValue(
      mediaQuery as unknown as MediaQueryList
    );

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('setTheme("light") resolves to light and removes dark class', async () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    await userEvent.click(screen.getByText('Set Light'));

    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('setTheme("dark") resolves to dark and adds dark class', async () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    await userEvent.click(screen.getByText('Set Dark'));

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('system theme updates when OS preference changes', async () => {
    const { mediaQuery, triggerChange } = makeMatchMediaMock(false);
    vi.spyOn(window, 'matchMedia').mockReturnValue(
      mediaQuery as unknown as MediaQueryList
    );

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');

    act(() => {
      triggerChange(true);
    });

    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('OS preference changes are ignored when theme is not system', async () => {
    const { mediaQuery, triggerChange } = makeMatchMediaMock(false);
    vi.spyOn(window, 'matchMedia').mockReturnValue(
      mediaQuery as unknown as MediaQueryList
    );

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    await userEvent.click(screen.getByText('Set Light'));

    act(() => {
      triggerChange(true);
    });

    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
  });

  it('persists theme choice to localStorage', async () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    await userEvent.click(screen.getByText('Set Dark'));
    expect(localStorage.getItem('theme')).toBe('dark');

    await userEvent.click(screen.getByText('Set System'));
    expect(localStorage.getItem('theme')).toBe('system');
  });

  it('uses stored theme from localStorage', () => {
    localStorage.setItem('theme', 'dark');
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
  });

  it('throws when useTheme is used outside ThemeProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      'useTheme must be used within a ThemeProvider'
    );
    consoleSpy.mockRestore();
  });
});
