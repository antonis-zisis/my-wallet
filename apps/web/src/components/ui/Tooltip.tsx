import { ReactNode, useRef, useState } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
}

export function Tooltip({ children, content }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);

  return (
    <span className="relative inline-flex items-center">
      <span
        ref={triggerRef}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        tabIndex={0}
        className="cursor-default outline-none"
      >
        {children}
      </span>

      {visible && (
        <span className="absolute bottom-full left-1/2 z-10 mb-1.5 w-52 -translate-x-1/2 rounded bg-gray-800 px-2.5 py-1.5 text-xs text-white shadow-lg dark:bg-gray-700">
          {content}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800 dark:border-t-gray-700" />
        </span>
      )}
    </span>
  );
}
