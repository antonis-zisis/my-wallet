import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';

import { CreateReportModal, ReportList } from '../components/reports';
import { Button, Pagination } from '../components/ui';
import { CREATE_REPORT, GET_REPORTS } from '../graphql/reports';
import { ReportsData } from '../types/report';

const PAGE_SIZE = 20;

export function Reports() {
  const [page, setPage] = useState(1);
  const { data, loading, error } = useQuery<ReportsData>(GET_REPORTS, {
    variables: { page },
  });
  const [createReport] = useMutation(CREATE_REPORT, {
    refetchQueries: [{ query: GET_REPORTS, variables: { page: 1 } }],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const reports = data?.reports.items ?? [];
  const totalCount = data?.reports.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleCreateReport = async (title: string) => {
    await createReport({ variables: { input: { title } } });
    setPage(1);
    setIsModalOpen(false);
  };

  return (
    <div className="py-8">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-6 flex items-center justify-end">
          <Button onClick={() => setIsModalOpen(true)}>Create Report</Button>
        </div>

        <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
          <ReportList reports={reports} loading={loading} error={!!error} />
        </div>

        {!loading && !error && totalCount > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={PAGE_SIZE}
            itemCount={reports.length}
            onPageChange={setPage}
          />
        )}
      </div>

      <CreateReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateReport}
      />
    </div>
  );
}
