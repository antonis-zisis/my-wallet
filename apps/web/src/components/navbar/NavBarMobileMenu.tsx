import { useState } from 'react';
import { NavLink } from 'react-router';

import { MenuIcon, XMarkIcon } from '../icons';
import { navLinks } from './navLinks';

const getLinkClassName = ({ isActive }: { isActive: boolean }) =>
  `block border-l-2 px-4 py-3 text-base font-medium transition-colors ${
    isActive
      ? 'border-brand-600 text-brand-600 bg-bg-muted dark:border-brand-400 dark:text-brand-400'
      : 'border-transparent text-text-secondary'
  }`;

export function NavBarMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        className="text-text-secondary hover:bg-bg-muted hover:text-text-primary -ml-2 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center self-center rounded transition-colors md:hidden"
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
      >
        <span className="h-5 w-5">{isOpen ? <XMarkIcon /> : <MenuIcon />}</span>
      </button>

      {isOpen && (
        <>
          <div
            aria-hidden="true"
            className="fixed inset-x-0 top-14 bottom-0 bg-black/20 md:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div className="border-border bg-bg-surface absolute inset-x-0 top-full z-10 flex flex-col border-b py-2 shadow-lg md:hidden">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={getLinkClassName}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </>
      )}
    </>
  );
}
