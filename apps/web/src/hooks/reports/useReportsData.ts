import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';

import { useToast } from '../../contexts/ToastContext';
import { useUser } from '../../contexts/UserContext';
import { CREATE_REPORT, GET_REPORTS } from '../../graphql/reports';
import {
  Report,
  REPORT_SORT_CONFIG,
  ReportsData,
  ReportSortOption,
} from '../../types/report';
import { useDebouncedValue } from '../useDebouncedValue';
import { useLocalStorage } from '../useLocalStorage';
import { useReportSharing } from './useReportSharing';

export const PAGE_SIZE = 10;

export function useReportsData() {
  const { showError, showSuccess } = useToast();
  const { user } = useUser();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useLocalStorage<ReportSortOption>(
    'reports.sortOption',
    'NEWEST'
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sharingReportId, setSharingReportId] = useState<string | null>(null);

  const sharing = useReportSharing({
    onLeft: () => setSharingReportId(null),
    reportId: sharingReportId ?? undefined,
  });

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

  const sharingReport =
    reports.find((report) => report.id === sharingReportId) ?? null;

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
    ...sharing,
    currentUserId: user?.supabaseId ?? '',
    error: !!error,
    isModalOpen,
    loading: loading && !resolvedData,
    onCloseModal: () => setIsModalOpen(false),
    onCloseShareModal: () => setSharingReportId(null),
    onCreateReport: handleCreateReport,
    onOpenModal: () => setIsModalOpen(true),
    onOpenShareModal: (report: Report) => setSharingReportId(report.id),
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
    sharingReport,
    sortOption,
    totalCount,
    totalPages,
  };
}
