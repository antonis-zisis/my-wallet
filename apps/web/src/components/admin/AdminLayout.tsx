import { Link, NavLink, Outlet } from 'react-router';

import { useUser } from '../../contexts/UserContext';
import { ShieldIcon } from '../icons';
import { Badge } from '../ui';

const adminLinks = [
  { end: true, label: 'Users', to: '/admin' },
  { label: 'Insights', to: '/admin/insights' },
];

export function AdminLayout() {
  const { user } = useUser();

  return (
    <div className="bg-bg-app min-h-screen">
      <header className="border-border border-b bg-slate-900 text-slate-100">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <ShieldIcon className="size-5 shrink-0 text-amber-400" />
            <span className="text-sm font-semibold tracking-wide">Admin</span>
            <Badge variant="warning" size="sm">
              Superadmin
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden truncate text-xs text-slate-400 sm:block">
              {user?.email}
            </span>
            <Link
              className="text-xs font-semibold text-slate-200 underline-offset-2 hover:underline"
              to="/"
            >
              Back to app
            </Link>
          </div>
        </div>

        <nav className="mx-auto flex max-w-5xl gap-4 px-4">
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              end={link.end}
              to={link.to}
              className={({ isActive }) =>
                `border-b-2 pb-2 text-sm ${
                  isActive
                    ? 'border-amber-400 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <Outlet />
    </div>
  );
}
