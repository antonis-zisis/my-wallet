import type { ReactNode } from 'react';

import { AppLogoIcon } from '../icons';
import { ThemeToggle } from '../ThemeToggle';
import { Card } from '../ui';

type AuthCardLayoutProps = {
  children: ReactNode;
  subtitle: string;
};

export function AuthCardLayout({ children, subtitle }: AuthCardLayoutProps) {
  return (
    <div className="bg-bg-app flex min-h-screen items-center justify-center p-4">
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md p-6 sm:p-8">
        <div className="mb-6 flex flex-col items-center gap-2">
          <AppLogoIcon className="text-brand-500 h-16 w-16" />

          <h1 className="text-text-primary text-2xl font-bold">My Wallet</h1>

          <p className="text-text-secondary text-sm">{subtitle}</p>
        </div>

        {children}
      </Card>
    </div>
  );
}
