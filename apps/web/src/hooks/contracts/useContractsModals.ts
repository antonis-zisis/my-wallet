import { useState } from 'react';

import { Contract } from '../../types/contract';

export function useContractsModals() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [contractToEdit, setContractToEdit] = useState<Contract | null>(null);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(
    null
  );

  return {
    isCreateOpen,
    onOpenCreate: () => setIsCreateOpen(true),
    onCloseCreate: () => setIsCreateOpen(false),
    contractToEdit,
    onSelectForEdit: setContractToEdit,
    contractToDelete,
    onSelectForDelete: setContractToDelete,
  };
}
