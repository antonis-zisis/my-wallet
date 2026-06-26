import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';

import { useToast } from '../../contexts/ToastContext';
import {
  CREATE_CONTRACT,
  DELETE_CONTRACT,
  GET_CONTRACTS,
  UPDATE_CONTRACT,
} from '../../graphql/contracts';
import { ContractsData, ContractSortField } from '../../types/contract';
import { useDebouncedValue } from '../useDebouncedValue';
import { useLocalStorage } from '../useLocalStorage';
import { getDaysUntilExpiration } from './selectors/getDaysUntilExpiration';
import { useContractsModals } from './useContractsModals';

export const PAGE_SIZE = 10;

const SORT_ORDER_BY_FIELD: Record<ContractSortField, 'ASC' | 'DESC'> = {
  END_DATE: 'ASC',
  PROVIDER: 'ASC',
};

export type ContractInput = {
  category: string;
  provider: string;
  plan?: string;
  startDate?: string;
  endDate?: string;
  cost?: number;
};

export function useContractsData() {
  const { showError, showSuccess } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useLocalStorage<ContractSortField>(
    'contracts.sortBy',
    'END_DATE'
  );
  const modals = useContractsModals();

  const debouncedSearch = useDebouncedValue(search);

  const variables = {
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch.trim() || undefined,
    sortBy,
    sortOrder: SORT_ORDER_BY_FIELD[sortBy],
  };

  const { data, error, loading, previousData } = useQuery<ContractsData>(
    GET_CONTRACTS,
    { variables }
  );

  const resolvedData = data ?? previousData;

  const [createContract] = useMutation(CREATE_CONTRACT, {
    refetchQueries: [
      { query: GET_CONTRACTS, variables: { ...variables, page: 1 } },
    ],
  });
  const [updateContract] = useMutation(UPDATE_CONTRACT, {
    refetchQueries: [{ query: GET_CONTRACTS, variables }],
  });
  const [deleteContract, { loading: isDeleting }] = useMutation(
    DELETE_CONTRACT,
    { refetchQueries: [{ query: GET_CONTRACTS, variables }] }
  );

  const items = resolvedData?.contracts.items ?? [];
  const totalCount = resolvedData?.contracts.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleCreate = async (input: ContractInput) => {
    try {
      await createContract({ variables: { input } });

      setPage(1);
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
    contractToDelete: modals.contractToDelete,
    contractToEdit: modals.contractToEdit,
    error: !!error,
    getDaysUntilExpiration,
    isCreateOpen: modals.isCreateOpen,
    isDeleting,
    items,
    loading: loading && !resolvedData,
    onCloseCreate: modals.onCloseCreate,
    onCreate: handleCreate,
    onDeleteConfirm: handleDeleteConfirm,
    onOpenCreate: modals.onOpenCreate,
    onPaginate: setPage,
    onSearchChange: (value: string) => {
      setSearch(value);
      setPage(1);
    },
    onSelectForDelete: modals.onSelectForDelete,
    onSelectForEdit: modals.onSelectForEdit,
    onSortChange: (sortField: ContractSortField) => {
      setSortBy(sortField);
      setPage(1);
    },
    onUpdate: handleUpdate,
    page,
    search,
    sortBy,
    totalCount,
    totalPages,
  };
}
