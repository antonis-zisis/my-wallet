import { Contract } from '../../types/contract';
import { CollapsibleSection, Pagination } from '../ui';
import { ContractList } from './ContractList';

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
  return (
    <CollapsibleSection
      className="mt-8"
      isCollapsible={isCollapsible}
      isOpen={isOpen}
      label={`Expired Contracts (${totalCount})`}
      onToggle={onToggle}
    >
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
    </CollapsibleSection>
  );
}
