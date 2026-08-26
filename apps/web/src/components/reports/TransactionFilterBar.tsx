import { FilterIcon } from '../icons';
import { Dropdown } from '../ui';

type FilterItem = {
  label: string;
  onClick: () => void;
};

type FilterTriggerProps = {
  isActive: boolean;
  label: string;
};

type TransactionFilterBarProps = {
  categoryFilterItems: Array<FilterItem>;
  hasMultipleTypes: boolean;
  presentCategoriesCount: number;
  selectedCategoryFilter: string;
  selectedTypeFilter: 'All' | 'Income' | 'Expense';
  typeFilterItems: Array<FilterItem>;
};

function FilterTrigger({ isActive, label }: FilterTriggerProps) {
  return (
    <button
      type="button"
      className={`flex cursor-pointer items-center gap-1.5 rounded border px-2.5 py-1.5 text-xs transition-colors ${
        isActive
          ? 'border-brand-500 text-brand-500'
          : 'border-border-strong text-text-secondary'
      }`}
    >
      <FilterIcon className="h-3.5 w-3.5 shrink-0" />
      {label}
    </button>
  );
}

export function TransactionFilterBar({
  categoryFilterItems,
  hasMultipleTypes,
  presentCategoriesCount,
  selectedCategoryFilter,
  selectedTypeFilter,
  typeFilterItems,
}: TransactionFilterBarProps) {
  if (!hasMultipleTypes && presentCategoriesCount === 0) {
    return null;
  }

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {hasMultipleTypes && (
        <Dropdown
          align="left"
          items={typeFilterItems}
          trigger={
            <FilterTrigger
              isActive={selectedTypeFilter !== 'All'}
              label={`Type: ${selectedTypeFilter}`}
            />
          }
        />
      )}

      {presentCategoriesCount > 0 && (
        <Dropdown
          align="left"
          items={categoryFilterItems}
          trigger={
            <FilterTrigger
              isActive={selectedCategoryFilter !== 'All'}
              label={`Category: ${selectedCategoryFilter}`}
            />
          }
        />
      )}
    </div>
  );
}
