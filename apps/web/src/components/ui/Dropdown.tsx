import { ReactNode, useEffect, useRef, useState } from 'react';

import { Button } from './Button';

export type DropdownItem =
  | {
      type?: 'action';
      icon?: ReactNode;
      label: string;
      onClick: () => void;
      variant?: 'default' | 'danger';
    }
  | {
      type: 'custom';
      content: ReactNode;
    };

interface DropdownProps {
  align?: 'left' | 'right';
  className?: string;
  items: Array<DropdownItem>;
  trigger?: ReactNode;
}

const actionStyles = {
  default: 'text-text-secondary hover:bg-bg-muted',
  danger: 'text-red-600 hover:bg-bg-muted dark:text-red-400',
};

export function Dropdown({
  align = 'right',
  className = 'relative',
  items,
  trigger,
}: DropdownProps) {
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
    <div className={className} ref={menuRef}>
      <div
        className="inline-flex items-center"
        onClick={() => setIsOpen((prev) => !prev)}
      >
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
        <div
          className={`border-border bg-bg-surface absolute z-10 mt-1 w-52 rounded border py-1 shadow-lg ${align === 'left' ? 'left-0' : 'right-0'}`}
        >
          {items.map((item, index) => {
            if (item.type === 'custom') {
              return <div key={index}>{item.content}</div>;
            }

            return (
              <button
                key={item.label}
                onClick={() => {
                  setIsOpen(false);
                  item.onClick();
                }}
                className={`flex w-full cursor-pointer items-center gap-3 px-4 py-2 text-left text-sm ${actionStyles[item.variant ?? 'default']}`}
              >
                {item.icon && (
                  <span className="h-4 w-4 shrink-0">{item.icon}</span>
                )}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
