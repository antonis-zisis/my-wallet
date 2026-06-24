import { Contract } from '../../types/contract';
import { DocumentTextIcon } from '../icons';
import { Card } from '../ui';
import { ContractListRow } from './ContractListRow';
import { ContractListSkeleton } from './ContractListSkeleton';

type ContractListProps = {
  contracts: Array<Contract>;
  loading: boolean;
  error: boolean;
  onEdit: (contract: Contract) => void;
  onDelete: (contract: Contract) => void;
  onAdd: () => void;
};

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="border-border flex flex-col items-center justify-center gap-3 rounded border-2 border-dashed py-10 text-center">
      <DocumentTextIcon className="text-border-strong size-10" />

      <p className="text-text-secondary text-sm font-medium">
        No contracts yet.
      </p>

      <button
        className="text-brand-600 dark:text-brand-400 cursor-pointer text-sm font-semibold hover:underline"
        onClick={onAdd}
      >
        Add your first contract
      </button>
    </div>
  );
}

export function ContractList({
  contracts,
  error,
  loading,
  onAdd,
  onDelete,
  onEdit,
}: ContractListProps) {
  if (loading) {
    return <ContractListSkeleton />;
  }

  if (error) {
    return (
      <p className="text-center text-red-500">Failed to load contracts.</p>
    );
  }

  if (contracts.length === 0) {
    return <EmptyState onAdd={onAdd} />;
  }

  return (
    <Card>
      <ul className="divide-border divide-y">
        {contracts.map((contract) => (
          <ContractListRow
            key={contract.id}
            contract={contract}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </ul>
    </Card>
  );
}
