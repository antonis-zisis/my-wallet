import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Modal } from '../components/ui';
import { Report } from '../types/report';
import { formatDate } from '../utils/formatDate';

const initialReports: Report[] = [
  {
    id: '1',
    title: 'December 2025',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: '2',
    title: 'January 2026',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10',
  },
  {
    id: '3',
    title: 'February 2026',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-05',
  },
];

export function Reports() {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReportTitle, setNewReportTitle] = useState('');

  const handleCreateReport = () => {
    if (!newReportTitle.trim()) {
      return;
    }

    const newReport: Report = {
      id: crypto.randomUUID(),
      title: newReportTitle.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setReports([newReport, ...reports]);
    setNewReportTitle('');
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewReportTitle('');
  };

  return (
    <div className="py-8">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-6 flex items-center justify-end">
          <Button onClick={() => setIsModalOpen(true)}>Create Report</Button>
        </div>

        <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
          {reports.length === 0 ? (
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
