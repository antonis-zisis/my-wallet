import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): 'light' | 'dark' {
  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function'
  ) {
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } catch {
      return 'light';
    }
  }
  return 'light';
}

function getStoredTheme(): Theme | null {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    } catch {
      return null;
    }
  }
  return null;
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? getSystemTheme() : theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(
    () => getStoredTheme() ?? 'system'
  );
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() =>
    resolveTheme(getStoredTheme() ?? 'system')
  );

  // useLayoutEffect so the class is applied before paint — avoids a visible
  // frame with the wrong background when resolvedTheme changes.
  // disabling-transitions suppresses CSS transitions for one frame so that
  // elements with transition-colors don't animate between theme values.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.add('disabling-transitions');
    root.classList.toggle('dark', resolvedTheme === 'dark');

    const frameId = requestAnimationFrame(() => {
      root.classList.remove('disabling-transitions');
    });

    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.error('Failed to save theme preference: ', error);
    }

    return () => {
      cancelAnimationFrame(frameId);
      root.classList.remove('disabling-transitions');
    };
  }, [theme, resolvedTheme]);

  // Only listen for OS preference changes when the user has chosen 'system'
  useEffect(() => {
    if (theme !== 'system') {
      return;
    }

    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return;
    }

    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (event: MediaQueryListEvent) => {
        setResolvedTheme(event.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } catch (error) {
      console.error('Failed to set up theme change listener: ', error);
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setResolvedTheme(resolveTheme(newTheme));
  };

  return (
    <ThemeContext.Provider value={{ resolvedTheme, setTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
