import { ReactNode, TransitionEvent, useId, useState } from 'react';

import { ChevronDownIcon } from '../icons';

type CollapsibleSectionProps = {
  children: ReactNode;
  className?: string;
  isCollapsible?: boolean;
  isOpen: boolean;
  label: string;
  onToggle: () => void;
};

const headerClass = 'text-text-secondary mb-4 text-sm font-medium';

export function CollapsibleSection({
  children,
  className = '',
  isCollapsible = true,
  isOpen,
  label,
  onToggle,
}: CollapsibleSectionProps) {
  const [hasFinishedExpanding, setHasFinishedExpanding] = useState(false);
  const contentId = useId();

  if (!isCollapsible) {
    return (
      <div className={className}>
        <p className={`${headerClass} pl-6`}>{label}</p>

        <div id={contentId}>{children}</div>
      </div>
    );
  }

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      setHasFinishedExpanding(isOpen);
    }
  };

  return (
    <div className={className}>
      <button
        aria-controls={contentId}
        aria-expanded={isOpen}
        className={`${headerClass} hover:text-text-primary flex cursor-pointer items-center gap-2`}
        type="button"
        onClick={onToggle}
      >
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
        {label}
      </button>

      <div
        aria-hidden={!isOpen}
        className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
        id={contentId}
        onTransitionEnd={handleTransitionEnd}
      >
        <div
          className={isOpen && hasFinishedExpanding ? '' : 'overflow-hidden'}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
