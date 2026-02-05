import { useState } from 'react';
import { Button, Input, Modal } from '../components/ui';

interface Report {
  id: string;
  title: string;
  createdAt: Date;
}

const initialReports: Report[] = [
  {
    id: '1',
    title: 'Monthly Budget Summary',
    createdAt: new Date('2024-01-15'),
  },
  { id: '2', title: 'Q4 Expense Analysis', createdAt: new Date('2024-01-10') },
  {
    id: '3',
    title: 'Annual Financial Review',
    createdAt: new Date('2024-01-05'),
  },
];

export function Reports() {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReportTitle, setNewReportTitle] = useState('');

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCreateReport = () => {
    if (!newReportTitle.trim()) {
      return;
    }

    const newReport: Report = {
      id: crypto.randomUUID(),
      title: newReportTitle.trim(),
      createdAt: new Date(),
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

        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          {reports.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No reports yet. Create your first one!
            </p>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {reports.map((report) => (
                <li
                  key={report.id}
                  className="flex items-center justify-between py-4"
                >
                  <span className="font-medium text-gray-800 dark:text-gray-100">
                    {report.title}
                  </span>

                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(report.createdAt)}
                  </span>
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
