import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';

import { useToast } from '../../contexts/ToastContext';
import { CREATE_REPORT, GET_REPORTS } from '../../graphql/reports';
import {
  REPORT_SORT_CONFIG,
  ReportsData,
  ReportSortOption,
} from '../../types/report';
import { useDebouncedValue } from '../useDebouncedValue';
import { useLocalStorage } from '../useLocalStorage';

export const PAGE_SIZE = 10;

export function useReportsData() {
  const { showError, showSuccess } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useLocalStorage<ReportSortOption>(
    'reports.sortOption',
    'NEWEST'
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const debouncedSearch = useDebouncedValue(search);
  const { sortBy, sortOrder } = REPORT_SORT_CONFIG[sortOption];

  const variables = {
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch.trim() || undefined,
    sortBy,
    sortOrder,
  };

  const { data, error, loading, previousData } = useQuery<ReportsData>(
    GET_REPORTS,
    { fetchPolicy: 'cache-first', variables }
  );

  const resolvedData = data ?? previousData;

  const [createReport] = useMutation(CREATE_REPORT, {
    refetchQueries: [
      { query: GET_REPORTS, variables: { ...variables, page: 1 } },
    ],
  });

  const reports = resolvedData?.reports.items ?? [];
  const totalCount = resolvedData?.reports.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleCreateReport = async (title: string) => {
    try {
      await createReport({ variables: { input: { title } } });

      setPage(1);
      setIsModalOpen(false);
      showSuccess('Report created.');
    } catch {
      showError('Failed to create report.');
      throw new Error('Failed to create report.');
    }
  };

  return {
    error: !!error,
    isModalOpen,
    loading: loading && !resolvedData,
    onCloseModal: () => setIsModalOpen(false),
    onCreateReport: handleCreateReport,
    onOpenModal: () => setIsModalOpen(true),
    onPageChange: setPage,
    onSearchChange: (value: string) => {
      setSearch(value);
      setPage(1);
    },
    onSortChange: (option: ReportSortOption) => {
      setSortOption(option);
      setPage(1);
    },
    page,
    reports,
    search,
    sortOption,
    totalCount,
    totalPages,
  };
}
