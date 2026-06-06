import { RefObject } from 'react';

interface NetWorthSnapshotModalSectionHeaderProps {
  containerRef?: RefObject<HTMLDivElement | null>;
  label: string;
  onAdd: () => void;
}

export function NetWorthSnapshotModalSectionHeader({
  containerRef,
  label,
  onAdd,
}: NetWorthSnapshotModalSectionHeaderProps) {
  return (
    <div ref={containerRef} className="flex items-center gap-2 py-1.5">
      <span className="text-text-tertiary text-xs font-semibold tracking-wide uppercase">
        {label}
      </span>
      <div className="border-border flex-1 border-t" />
      <button
        className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 cursor-pointer text-xs"
        onClick={onAdd}
      >
        + Add
      </button>
    </div>
  );
}
