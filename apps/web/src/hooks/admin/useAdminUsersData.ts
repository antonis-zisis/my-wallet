import { useQuery } from '@apollo/client/react';
import { useState } from 'react';

import { GET_ADMIN_USERS } from '../../graphql/admin';
import { AdminUsersData, AdminUserSortField } from '../../types/admin';
import { useDebouncedValue } from '../useDebouncedValue';
import { useAdminUsersModals } from './useAdminUsersModals';
import { useAdminUsersMutations } from './useAdminUsersMutations';

export const PAGE_SIZE = 20;

const SORT_ORDER_BY_FIELD: Record<AdminUserSortField, 'ASC' | 'DESC'> = {
  CREATED_AT: 'DESC',
  EMAIL: 'ASC',
  LAST_SEEN_AT: 'DESC',
};

export function useAdminUsersData() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<AdminUserSortField>('CREATED_AT');
  const modals = useAdminUsersModals();

  const debouncedSearch = useDebouncedValue(search);
  const activeSearch = debouncedSearch.trim() || undefined;

  const variables = {
    page,
    pageSize: PAGE_SIZE,
    search: activeSearch,
    sortBy,
    sortOrder: SORT_ORDER_BY_FIELD[sortBy],
  };

  const { data, error, loading, previousData } = useQuery<AdminUsersData>(
    GET_ADMIN_USERS,
    { variables }
  );

  const resolvedData = data ?? previousData;

  const mutations = useAdminUsersMutations({ modals, variables });

  const totalCount = resolvedData?.adminUsers.totalCount ?? 0;

  return {
    error: !!error,
    isDeleting: mutations.isDeleting,
    items: resolvedData?.adminUsers.items ?? [],
    loading: loading && !resolvedData,
    onDeleteConfirm: mutations.onDeleteConfirm,
    onPaginate: setPage,
    onSearchChange: (value: string) => {
      setSearch(value);
      setPage(1);
    },
    onSelectForDelete: modals.onSelectForDelete,
    onSortChange: (sortField: AdminUserSortField) => {
      setSortBy(sortField);
      setPage(1);
    },
    page,
    search,
    sortBy,
    totalCount,
    totalPages: Math.ceil(totalCount / PAGE_SIZE),
    userToDelete: modals.userToDelete,
  };
}
