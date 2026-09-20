import {
  WINDOW_OPTIONS,
  WindowOption,
} from '../../hooks/transactions/useCategoryTrendsData';
import { LockClosedIcon } from '../icons';
import { Skeleton } from '../ui';

type CategoryTrendsWindowPickerProps = {
  maxMonths?: number | null;
  value: WindowOption;
  onChange: (months: WindowOption) => void;
  onLockedSelect?: (months: WindowOption) => void;
};

export function CategoryTrendsWindowPicker({
  maxMonths = null,
  onChange,
  onLockedSelect,
  value,
}: CategoryTrendsWindowPickerProps) {
  return (
    <div className="border-border flex w-full overflow-hidden rounded border sm:w-auto">
      {WINDOW_OPTIONS.map((option) => {
        const isLocked = maxMonths !== null && option > maxMonths;

        return (
          <button
            key={option}
            type="button"
            aria-label={isLocked ? `${option} months (Pro)` : undefined}
            onClick={() =>
              isLocked ? onLockedSelect?.(option) : onChange(option)
            }
            className={`border-border flex flex-1 cursor-pointer items-center justify-center gap-1 border-l px-3 py-1.5 text-xs font-medium transition-colors first:border-l-0 sm:flex-none ${
              value === option
                ? 'bg-brand-600 text-white'
                : 'bg-bg-surface text-text-secondary hover:bg-bg-muted'
            } ${isLocked ? 'opacity-60' : ''}`}
          >
            {isLocked && <LockClosedIcon className="h-3 w-3" />}
            {option} months
          </button>
        );
      })}
    </div>
  );
}

export function CategoryTrendsWindowPickerSkeleton() {
  return <Skeleton className="h-[30px] w-full sm:w-80" />;
}
