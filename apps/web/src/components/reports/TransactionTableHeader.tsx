import { FilterIcon } from '../icons';
import { Dropdown } from '../ui';

type FilterItem = {
  label: string;
  onClick: () => void;
};

type TransactionTableHeaderProps = {
  categoryFilterItems: Array<FilterItem>;
  hasMultipleTypes: boolean;
  presentCategoriesCount: number;
  selectedCategoryFilter: string;
  selectedTypeFilter: 'All' | 'Income' | 'Expense';
  typeFilterItems: Array<FilterItem>;
};

export function TransactionTableHeader({
  categoryFilterItems,
  hasMultipleTypes,
  presentCategoriesCount,
  selectedCategoryFilter,
  selectedTypeFilter,
  typeFilterItems,
}: TransactionTableHeaderProps) {
  const typeIconColor =
    selectedTypeFilter !== 'All' ? 'text-brand-500' : 'text-text-tertiary';
  const categoryIconColor =
    selectedCategoryFilter !== 'All' ? 'text-brand-500' : 'text-text-tertiary';

  return (
    <thead>
      <tr className="border-border text-text-secondary border-b text-left text-sm font-medium">
        <th className="pr-4 pb-3">Date</th>
        <th className="pr-4 pb-3">
          <div className="flex items-center gap-1.5">
            Type
            {hasMultipleTypes && (
              <Dropdown
                align="left"
                className="relative inline-flex items-center"
                items={typeFilterItems}
                trigger={
                  <button className="hover:bg-bg-muted cursor-pointer rounded p-0.5">
                    <FilterIcon className={`h-3.5 w-3.5 ${typeIconColor}`} />
                  </button>
                }
              />
            )}
          </div>
        </th>
        <th className="pr-4 pb-3">
          <div className="flex items-center gap-1.5">
            Category
            {presentCategoriesCount > 0 && (
              <Dropdown
                align="left"
                className="relative inline-flex items-center"
                items={categoryFilterItems}
                trigger={
                  <button className="hover:bg-bg-muted cursor-pointer rounded p-0.5">
                    <FilterIcon
                      className={`h-3.5 w-3.5 ${categoryIconColor}`}
                    />
                  </button>
                }
              />
            )}
          </div>
        </th>
        <th className="pr-4 pb-3">Description</th>
        <th className="pb-3 text-right">Amount</th>
        <th className="pb-3"></th>
      </tr>
    </thead>
  );
}
