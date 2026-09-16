import type { ReactNode } from 'react';
import { Link } from 'react-router';

type AuthLinkProps = {
  children: ReactNode;
  to: string;
};

export function AuthLink({ children, to }: AuthLinkProps) {
  return (
    <Link
      to={to}
      className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 text-sm"
    >
      {children}
    </Link>
  );
}
