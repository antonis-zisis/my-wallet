import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';

import { CreateReportModal, ReportList } from '../components/reports';
import { Button } from '../components/ui';
import { CREATE_REPORT, GET_REPORTS } from '../graphql/reports';
import { ReportsData } from '../types/report';

export function Reports() {
  const { data, loading, error } = useQuery<ReportsData>(GET_REPORTS);
  const [createReport] = useMutation(CREATE_REPORT, {
    refetchQueries: [{ query: GET_REPORTS }],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const reports = data?.reports.items ?? [];
  const totalCount = data?.reports.totalCount ?? 0;

  const handleCreateReport = async (title: string) => {
    await createReport({ variables: { input: { title } } });
    setIsModalOpen(false);
  };

  return (
    <div className="py-8">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-6 flex items-center justify-end">
          <Button onClick={() => setIsModalOpen(true)}>Create Report</Button>
        </div>

        <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
          <ReportList reports={reports} loading={loading} error={!!error} />
        </div>

        {!loading && !error && totalCount > 0 && (
          <p className="mt-2 text-right text-xs text-gray-500 dark:text-gray-400">
            Showing 1 - {reports.length} of {totalCount}
          </p>
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
