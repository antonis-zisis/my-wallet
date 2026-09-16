import { Contract } from '../../types/contract';
import { ChevronDownIcon } from '../icons';
import { Pagination } from '../ui';
import { ContractList } from './ContractList';

const SECTION_ID = 'expired-contracts-section';

type ExpiredContractsSectionProps = {
  contracts: Array<Contract>;
  error: boolean;
  isCollapsible: boolean;
  isOpen: boolean;
  loading: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onDelete: (contract: Contract) => void;
  onEdit: (contract: Contract) => void;
  onPageChange: (page: number) => void;
  onToggle: () => void;
};

export function ExpiredContractsSection({
  contracts,
  error,
  isCollapsible,
  isOpen,
  loading,
  onDelete,
  onEdit,
  onPageChange,
  onToggle,
  page,
  pageSize,
  totalCount,
  totalPages,
}: ExpiredContractsSectionProps) {
  const label = `Expired Contracts (${totalCount})`;

  return (
    <div className="mt-8">
      {isCollapsible ? (
        <button
          aria-controls={SECTION_ID}
          aria-expanded={isOpen}
          className="text-text-secondary hover:text-text-primary mb-4 flex cursor-pointer items-center gap-2 text-sm font-medium"
          type="button"
          onClick={onToggle}
        >
          <ChevronDownIcon
            className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
          {label}
        </button>
      ) : (
        <p className="text-text-secondary mb-4 pl-6 text-sm font-medium">
          {label}
        </p>
      )}

      <div
        aria-hidden={!isOpen}
        className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
        id={SECTION_ID}
      >
        <div className="overflow-hidden">
          <ContractList
            contracts={contracts}
            error={error}
            loading={loading}
            onDelete={onDelete}
            onEdit={onEdit}
          />

          {!loading && !error && (
            <Pagination
              itemCount={contracts.length}
              page={page}
              pageSize={pageSize}
              totalCount={totalCount}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
