import { useState } from 'react';
import { Link, NavLink } from 'react-router';

import { AppLogoIcon } from './icons';
import { NavBarMobileMenu } from './navbar/NavBarMobileMenu';
import { NavBarUserMenu } from './navbar/NavBarUserMenu';
import { navLinks } from './navbar/navLinks';
import { PrivacyToggle } from './PrivacyToggle';
import { ThemeToggle } from './ThemeToggle';
import { WhatsNewModal } from './WhatsNewModal';

const getLinkClassName = ({ isActive }: { isActive: boolean }) =>
  `flex items-center px-3 text-sm font-medium transition-colors border-b-2 ${
    isActive
      ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
      : 'border-transparent text-text-secondary hover:border-border-strong hover:text-text-primary'
  }`;

export function NavBar() {
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);

  return (
    <>
      <nav className="border-border bg-bg-surface sticky top-0 z-20 border-b">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex h-14 items-stretch justify-between gap-2">
            <div className="flex min-w-0 items-stretch gap-2 md:gap-0">
              <NavBarMobileMenu />

              <Link
                to="/"
                className="text-text-primary flex items-center gap-2 md:mr-4"
              >
                <AppLogoIcon className="text-brand-500 h-6 w-6 shrink-0" />
                <span className="truncate text-sm font-semibold">
                  My Wallet
                </span>
              </Link>

              <div className="bg-border my-3 hidden w-px md:block" />

              <div className="hidden items-stretch md:flex">
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
            </div>

            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <PrivacyToggle />
              <ThemeToggle />
              <NavBarUserMenu onOpenWhatsNew={() => setIsWhatsNewOpen(true)} />
            </div>
          </div>
        </div>
      </nav>

      <WhatsNewModal
        isOpen={isWhatsNewOpen}
        onClose={() => setIsWhatsNewOpen(false)}
      />
    </>
  );
}
