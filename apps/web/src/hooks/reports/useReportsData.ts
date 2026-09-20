import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { useToast } from '../../contexts/ToastContext';
import { useUser } from '../../contexts/UserContext';
import { CREATE_REPORT, GET_REPORTS } from '../../graphql/reports';
import {
  REPORT_SORT_CONFIG,
  ReportsData,
  ReportSortOption,
} from '../../types/report';
import { getPlanLimitMessage } from '../../utils/getPlanLimitMessage';
import { useDebouncedValue } from '../useDebouncedValue';
import { useLocalStorage } from '../useLocalStorage';

export const PAGE_SIZE = 10;

export function useReportsData() {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const { user } = useUser();
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

  const [createReport] = useMutation<{ createReport: { id: string } }>(
    CREATE_REPORT,
    {
      refetchQueries: [
        { query: GET_REPORTS, variables: { ...variables, page: 1 } },
      ],
    }
  );

  const reports = resolvedData?.reports.items ?? [];
  const totalCount = resolvedData?.reports.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleCreateReport = async (title: string) => {
    try {
      const { data: created } = await createReport({
        variables: { input: { title } },
      });

      setPage(1);
      setIsModalOpen(false);
      showSuccess('Report created.');

      if (created?.createReport.id) {
        navigate(`/reports/${created.createReport.id}`);
      }
    } catch (error) {
      showError(getPlanLimitMessage(error) ?? 'Failed to create report.');
      throw new Error('Failed to create report.', { cause: error });
    }
  };

  return {
    currentUserId: user?.supabaseId ?? '',
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
