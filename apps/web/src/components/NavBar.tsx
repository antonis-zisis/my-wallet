import { useQuery } from '@apollo/client/react';
import { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { useUser } from '../contexts/UserContext';
import { HEALTH_QUERY } from '../graphql/health';
import { getInitials } from '../utils/getInitials';
import { LogOutIcon, MoonIcon, SunIcon, UserIcon } from './icons';
import { Dropdown } from './ui';

const navLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/reports', label: 'Reports' },
  { to: '/subscriptions', label: 'Subscriptions' },
  { to: '/net-worth', label: 'Net Worth' },
];

const getLinkClassName = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
  }`;

export function NavBar() {
  const { signOut } = useAuth();
  const { loading, user } = useUser();
  const { theme, toggleTheme } = useTheme();
  const { showError } = useToast();
  const navigate = useNavigate();
  const { error: healthError, loading: healthLoading } = useQuery<{
    health: string;
  }>(HEALTH_QUERY);

  useEffect(() => {
    if (healthError) {
      showError('Unable to connect to server.');
    }
  }, [healthError, showError]);

  const dotConfig = healthLoading
    ? { core: 'bg-gray-400 dark:bg-gray-500', ping: null }
    : healthError
      ? { core: 'bg-red-500', ping: null }
      : { core: 'bg-emerald-500', ping: 'bg-emerald-400' };

  return (
    <nav className="bg-white shadow-md dark:bg-gray-800">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={getLinkClassName}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              {dotConfig.ping && (
                <span
                  className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${dotConfig.ping}`}
                />
              )}

              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${dotConfig.core}`}
              />
            </span>

            {loading ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-300 dark:bg-gray-600" />
            ) : (
              user && (
                <Dropdown
                  items={[
                    {
                      icon: <UserIcon />,
                      label: 'Profile',
                      onClick: () => navigate('/profile'),
                    },
                    {
                      type: 'custom',
                      content: (
                        <button
                          onClick={toggleTheme}
                          className="flex w-full cursor-pointer items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                        >
                          <span className="h-4 w-4 shrink-0">
                            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                          </span>
                          {theme === 'light' ? 'Dark mode' : 'Light mode'}
                        </button>
                      ),
                    },
                    {
                      icon: <LogOutIcon />,
                      label: 'Log out',
                      variant: 'danger',
                      onClick: signOut,
                    },
                  ]}
                  trigger={
                    <button
                      aria-label="User menu"
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blue-500 text-xs font-medium tracking-wider text-white hover:bg-blue-600"
                    >
                      {getInitials(user.fullName ?? user.email)}
                    </button>
                  }
                />
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
