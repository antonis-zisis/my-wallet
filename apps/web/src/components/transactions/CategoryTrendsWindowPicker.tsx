import {
  WINDOW_OPTIONS,
  WindowOption,
} from '../../hooks/transactions/useCategoryTrendsData';
import { Skeleton } from '../ui';

type CategoryTrendsWindowPickerProps = {
  value: WindowOption;
  onChange: (months: WindowOption) => void;
};

export function CategoryTrendsWindowPicker({
  onChange,
  value,
}: CategoryTrendsWindowPickerProps) {
  return (
    <div className="border-border flex w-full overflow-hidden rounded border sm:w-auto">
      {WINDOW_OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`border-border flex-1 cursor-pointer border-l px-3 py-1.5 text-xs font-medium transition-colors first:border-l-0 sm:flex-none ${
            value === option
              ? 'bg-brand-600 text-white'
              : 'bg-bg-surface text-text-secondary hover:bg-bg-muted'
          }`}
        >
          {option} months
        </button>
      ))}
    </div>
  );
}

export function CategoryTrendsWindowPickerSkeleton() {
  return <Skeleton className="h-[30px] w-full sm:w-80" />;
}
