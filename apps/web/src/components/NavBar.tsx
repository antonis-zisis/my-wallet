import { useQuery } from '@apollo/client/react';
import { useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { useUser } from '../contexts/UserContext';
import { HEALTH_QUERY } from '../graphql/health';
import { getInitials } from '../utils/getInitials';
import { LogOutIcon, MoonIcon, SunIcon, UserIcon, WalletIcon } from './icons';
import { Dropdown } from './ui';

const navLinks = [
  { end: true, label: 'Overview', to: '/' },
  { label: 'Reports', to: '/reports' },
  { label: 'Subscriptions', to: '/subscriptions' },
  { label: 'Net Worth', to: '/net-worth' },
];

const getLinkClassName = ({ isActive }: { isActive: boolean }) =>
  `flex items-center px-3 text-sm font-medium transition-colors border-b-2 ${
    isActive
      ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200'
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

  const healthDotClass = healthLoading
    ? 'bg-gray-400 dark:bg-gray-500'
    : healthError
      ? 'bg-red-500'
      : 'bg-emerald-500';

  const healthTitle = healthLoading
    ? 'Connecting...'
    : healthError
      ? 'Server offline'
      : 'Server connected';

  return (
    <nav className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex h-14 items-stretch justify-between">
          <div className="flex items-stretch">
            <Link
              to="/"
              className="mr-4 flex items-center gap-2 text-gray-900 dark:text-white"
            >
              <WalletIcon className="text-brand-600 h-5 w-5" />
              <span className="text-sm font-semibold">My Wallet</span>
            </Link>

            <div className="my-3 w-px bg-gray-200 dark:bg-gray-700" />

            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={getLinkClassName}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              <span className="h-4 w-4">
                {theme === 'light' ? <MoonIcon /> : <SunIcon />}
              </span>
            </button>

            {loading ? (
              <div className="h-9 w-9 animate-pulse rounded-full bg-gray-300 dark:bg-gray-600" />
            ) : (
              user && (
                <Dropdown
                  items={[
                    {
                      type: 'custom',
                      content: (
                        <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-700">
                          {user.fullName && (
                            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                              {user.fullName}
                            </p>
                          )}
                          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                            {user.email}
                          </p>
                        </div>
                      ),
                    },
                    {
                      icon: <UserIcon />,
                      label: 'Profile',
                      onClick: () => navigate('/profile'),
                    },
                    {
                      icon: <LogOutIcon />,
                      label: 'Log out',
                      variant: 'danger',
                      onClick: signOut,
                    },
                  ]}
                  trigger={
                    <div className="relative">
                      <button
                        aria-label="User menu"
                        className="bg-brand-500 hover:bg-brand-600 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-xs font-medium tracking-wider text-white ring-2 ring-white transition-colors dark:ring-gray-800"
                      >
                        {getInitials(user.fullName ?? user.email)}
                      </button>
                      <span
                        className={`absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 ${healthDotClass}`}
                        title={healthTitle}
                      />
                    </div>
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
