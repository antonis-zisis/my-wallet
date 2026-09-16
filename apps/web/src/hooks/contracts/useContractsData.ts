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
  const [expiredPage, setExpiredPage] = useState(1);
  const [showExpired, setShowExpired] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useLocalStorage<ContractSortField>(
    'contracts.sortBy',
    'END_DATE'
  );
  const modals = useContractsModals();

  const debouncedSearch = useDebouncedValue(search);
  const activeSearch = debouncedSearch.trim() || undefined;

  const variables = {
    expired: false,
    page,
    pageSize: PAGE_SIZE,
    search: activeSearch,
    sortBy,
    sortOrder: SORT_ORDER_BY_FIELD[sortBy],
  };

  const expiredVariables = {
    expired: true,
    page: expiredPage,
    pageSize: PAGE_SIZE,
    search: activeSearch,
    sortBy: 'END_DATE' as const,
    sortOrder: 'DESC' as const,
  };

  const { data, error, loading, previousData } = useQuery<ContractsData>(
    GET_CONTRACTS,
    { variables }
  );

  const {
    data: expiredData,
    error: expiredError,
    loading: expiredFetching,
    previousData: expiredPreviousData,
  } = useQuery<ContractsData>(GET_CONTRACTS, { variables: expiredVariables });

  const resolvedData = data ?? previousData;
  const resolvedExpiredData = expiredData ?? expiredPreviousData;

  const mutations = useContractsMutations({
    expiredVariables,
    modals,
    variables,
    onResetPage: () => setPage(1),
  });

  const items = resolvedData?.contracts.items ?? [];
  const totalCount = resolvedData?.contracts.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const expiredItems = resolvedExpiredData?.contracts.items ?? [];
  const expiredTotalCount = resolvedExpiredData?.contracts.totalCount ?? 0;
  const expiredTotalPages = Math.ceil(expiredTotalCount / PAGE_SIZE);

  const isSearching = !!activeSearch;

  return {
    contractToDelete: modals.contractToDelete,
    contractToEdit: modals.contractToEdit,
    error: !!error,
    expiredError: !!expiredError,
    expiredItems,
    expiredLoading: expiredFetching && !resolvedExpiredData,
    expiredPage,
    expiredTotalCount,
    expiredTotalPages,
    getDaysUntilExpiration,
    hasOnlyExpiredContracts: totalCount === 0 && expiredTotalCount > 0,
    isCreateOpen: modals.isCreateOpen,
    isDeleting: mutations.isDeleting,
    isExpiredCollapsible: !isSearching,
    isExpiredOpen: isSearching || showExpired,
    items,
    loading: loading && !resolvedData,
    onCloseCreate: modals.onCloseCreate,
    onCreate: mutations.onCreate,
    onDeleteConfirm: mutations.onDeleteConfirm,
    onExpiredPaginate: setExpiredPage,
    onOpenCreate: modals.onOpenCreate,
    onPaginate: setPage,
    onSearchChange: (value: string) => {
      setSearch(value);
      setPage(1);
      setExpiredPage(1);
    },
    onSelectForDelete: modals.onSelectForDelete,
    onSelectForEdit: modals.onSelectForEdit,
    onSortChange: (sortField: ContractSortField) => {
      setSortBy(sortField);
      setPage(1);
    },
    onToggleExpired: () => setShowExpired((previous) => !previous),
    onUpdate: mutations.onUpdate,
    page,
    search,
    sortBy,
    totalCount,
    totalPages,
  };
}
