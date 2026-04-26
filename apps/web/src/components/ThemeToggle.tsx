import { type Theme, useTheme } from '../contexts/ThemeContext';
import { MonitorIcon, MoonIcon, SunIcon } from './icons';

const CYCLE_ORDER: Array<Theme> = ['system', 'light', 'dark'];

const THEME_ICONS: Record<Theme, React.ComponentType> = {
  dark: MoonIcon,
  light: SunIcon,
  system: MonitorIcon,
};

const NEXT_THEME_LABEL: Record<Theme, string> = {
  dark: 'Switch to system mode',
  light: 'Switch to dark mode',
  system: 'Switch to light mode',
};

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const Icon = THEME_ICONS[theme];
  const nextTheme =
    CYCLE_ORDER[(CYCLE_ORDER.indexOf(theme) + 1) % CYCLE_ORDER.length];

  return (
    <button
      aria-label={NEXT_THEME_LABEL[theme]}
      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
      onClick={() => setTheme(nextTheme)}
    >
      <span className="h-4 w-4">
        <Icon />
      </span>
    </button>
  );
}
