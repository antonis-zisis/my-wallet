import { useMutation } from '@apollo/client/react';

import { useToast } from '../../contexts/ToastContext';
import {
  CREATE_CONTRACT,
  DELETE_CONTRACT,
  GET_CONTRACTS,
  UPDATE_CONTRACT,
} from '../../graphql/contracts';
import { ContractSortField } from '../../types/contract';
import { useContractsModals } from './useContractsModals';

export type ContractInput = {
  category: string;
  provider: string;
  plan?: string;
  startDate?: string;
  endDate?: string;
  cost?: number;
};

type ContractsQueryVariables = {
  expired?: boolean;
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: ContractSortField;
  sortOrder?: 'ASC' | 'DESC';
};

type ContractsModals = ReturnType<typeof useContractsModals>;

type UseContractsMutationsInput = {
  expiredVariables: ContractsQueryVariables;
  modals: ContractsModals;
  onResetPage: () => void;
  variables: ContractsQueryVariables;
};

export function useContractsMutations({
  expiredVariables,
  modals,
  onResetPage,
  variables,
}: UseContractsMutationsInput) {
  const { showError, showSuccess } = useToast();

  const refetchBothLists = [
    { query: GET_CONTRACTS, variables },
    { query: GET_CONTRACTS, variables: expiredVariables },
  ];

  const [createContract] = useMutation(CREATE_CONTRACT, {
    refetchQueries: [
      { query: GET_CONTRACTS, variables: { ...variables, page: 1 } },
      { query: GET_CONTRACTS, variables: expiredVariables },
    ],
  });

  const [updateContract] = useMutation(UPDATE_CONTRACT, {
    refetchQueries: refetchBothLists,
  });

  const [deleteContract, { loading: isDeleting }] = useMutation(
    DELETE_CONTRACT,
    { refetchQueries: refetchBothLists }
  );

  const handleCreate = async (input: ContractInput) => {
    try {
      await createContract({ variables: { input } });

      onResetPage();
      modals.onCloseCreate();
      showSuccess('Contract created.');
    } catch {
      showError('Failed to create contract.');
    }
  };

  const handleUpdate = async (input: ContractInput & { id: string }) => {
    try {
      await updateContract({ variables: { input } });

      modals.onSelectForEdit(null);
      showSuccess('Contract updated.');
    } catch {
      showError('Failed to update contract.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!modals.contractToDelete) {
      return;
    }

    try {
      await deleteContract({ variables: { id: modals.contractToDelete.id } });

      modals.onSelectForDelete(null);
      showSuccess('Contract deleted.');
    } catch {
      showError('Failed to delete contract.');
    }
  };

  return {
    isDeleting,
    onCreate: handleCreate,
    onDeleteConfirm: handleDeleteConfirm,
    onUpdate: handleUpdate,
  };
}
