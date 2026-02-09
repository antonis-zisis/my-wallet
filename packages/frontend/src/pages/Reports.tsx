import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { Button, Input, Modal } from '../components/ui';
import { GET_REPORTS, CREATE_REPORT } from '../graphql/reports';
import { Report } from '../types/report';
import { formatDate } from '../utils/formatDate';

export function Reports() {
  const { data, loading, error } = useQuery<{ reports: Report[] }>(GET_REPORTS);
  const [createReport] = useMutation(CREATE_REPORT, {
    refetchQueries: [{ query: GET_REPORTS }],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReportTitle, setNewReportTitle] = useState('');

  const handleCreateReport = async () => {
    if (!newReportTitle.trim()) {
      return;
    }

    await createReport({
      variables: { input: { title: newReportTitle.trim() } },
    });
    setNewReportTitle('');
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewReportTitle('');
  };

  const reports = data?.reports ?? [];

  return (
    <div className="py-8">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-6 flex items-center justify-end">
          <Button onClick={() => setIsModalOpen(true)}>Create Report</Button>
        </div>

        <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
          {loading ? (
            <p className="text-center text-gray-500 dark:text-gray-400">
              Loading reports...
            </p>
          ) : error ? (
            <p className="text-center text-red-500">Failed to load reports.</p>
          ) : reports.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No reports yet. Create your first one!
            </p>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {reports.map((report) => (
                <li key={report.id}>
                  <Link
                    to={`/reports/${report.id}`}
                    className="flex items-center justify-between px-1 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <span className="font-medium text-gray-800 dark:text-gray-100">
                      {report.title}
                    </span>

                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(report.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Create Report"
        footer={
          <>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>

            <Button
              onClick={handleCreateReport}
              disabled={!newReportTitle.trim()}
            >
              Create
            </Button>
          </>
        }
      >
        <Input
          label="Report Title"
          id="report-title"
          placeholder="Enter report title"
          value={newReportTitle}
          onChange={(event) => setNewReportTitle(event.target.value)}
          autoFocus
        />
      </Modal>
    </div>
  );
}
