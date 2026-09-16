import { useQuery } from '@apollo/client/react';
import { useState } from 'react';

import { GET_CONTRACTS } from '../../graphql/contracts';
import { ContractsData, ContractSortField } from '../../types/contract';
import { useDebouncedValue } from '../useDebouncedValue';
import { useLocalStorage } from '../useLocalStorage';
import { getDaysUntilExpiration } from './selectors/getDaysUntilExpiration';
import { useContractsModals } from './useContractsModals';
import { useContractsMutations } from './useContractsMutations';

export const PAGE_SIZE = 10;

const SORT_ORDER_BY_FIELD: Record<ContractSortField, 'ASC' | 'DESC'> = {
  END_DATE: 'ASC',
  PROVIDER: 'ASC',
};

export function useContractsData() {
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

  const mutations = useContractsMutations({
    modals,
    variables,
    onResetPage: () => setPage(1),
  });

  const items = resolvedData?.contracts.items ?? [];
  const totalCount = resolvedData?.contracts.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return {
    contractToDelete: modals.contractToDelete,
    contractToEdit: modals.contractToEdit,
    error: !!error,
    getDaysUntilExpiration,
    isCreateOpen: modals.isCreateOpen,
    isDeleting: mutations.isDeleting,
    items,
    loading: loading && !resolvedData,
    onCloseCreate: modals.onCloseCreate,
    onCreate: mutations.onCreate,
    onDeleteConfirm: mutations.onDeleteConfirm,
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
    onUpdate: mutations.onUpdate,
    page,
    search,
    sortBy,
    totalCount,
    totalPages,
  };
}
