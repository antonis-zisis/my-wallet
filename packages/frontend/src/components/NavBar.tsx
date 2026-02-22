import { NavLink, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import ThemeToggle from './ThemeToggle';
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

function getInitial(user: { fullName: string | null; email: string }): string {
  const source = user.fullName || user.email;
  return source.charAt(0).toUpperCase();
}

export function NavBar() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-md dark:bg-gray-800">
      <div className="mx-auto max-w-3xl px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={getLinkClassName}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            {user && (
              <Dropdown
                items={[
                  {
                    label: 'Profile',
                    onClick: () => navigate('/profile'),
                  },
                  {
                    label: 'Log out',
                    variant: 'danger',
                    onClick: signOut,
                  },
                ]}
                trigger={
                  <button
                    aria-label="User menu"
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white hover:bg-blue-600"
                  >
                    {getInitial(user)}
                  </button>
                }
              />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
