import { ReactNode, useEffect, useRef, useState } from 'react';

import { Button } from './Button';

export interface DropdownItem {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

interface DropdownProps {
  items: Array<DropdownItem>;
  trigger?: ReactNode;
}

const itemStyles = {
  default:
    'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
  danger:
    'text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700',
};

export function Dropdown({ items, trigger }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <div onClick={() => setIsOpen((prev) => !prev)}>
        {trigger ?? (
          <Button variant="ghost" size="sm" aria-label="Options">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5 rotate-90"
            >
              <path d="M10 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM10 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM11.5 15.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" />
            </svg>
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-1 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setIsOpen(false);
                item.onClick();
              }}
              className={`w-full cursor-pointer px-4 py-2 text-left text-sm ${itemStyles[item.variant ?? 'default']}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
