import { NavLink } from 'react-router-dom';

import ThemeToggle from './ThemeToggle';

const navLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/reports', label: 'Reports' },
];

const getLinkClassName = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
  }`;

export function NavBar() {
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

          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
