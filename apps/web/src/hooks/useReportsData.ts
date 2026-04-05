import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';

import { CREATE_REPORT, GET_REPORTS } from '../graphql/reports';
import { ReportsData } from '../types/report';

export const PAGE_SIZE = 10;

export function useReportsData() {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, error, loading } = useQuery<ReportsData>(GET_REPORTS, {
    fetchPolicy: 'cache-first',
    variables: { page },
  });

  const [createReport] = useMutation(CREATE_REPORT, {
    refetchQueries: [{ query: GET_REPORTS, variables: { page: 1 } }],
  });

  const reports = data?.reports.items ?? [];
  const totalCount = data?.reports.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleCreateReport = async (title: string) => {
    await createReport({ variables: { input: { title } } });
    setPage(1);
    setIsModalOpen(false);
  };

  return {
    error: !!error,
    isModalOpen,
    loading,
    onCloseModal: () => setIsModalOpen(false),
    onCreateReport: handleCreateReport,
    onOpenModal: () => setIsModalOpen(true),
    onPageChange: setPage,
    page,
    reports,
    totalCount,
    totalPages,
  };
}
