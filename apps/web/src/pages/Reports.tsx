import { CreateReportModal, ReportList } from '../components/reports';
import { Button, PageLayout, Pagination } from '../components/ui';
import { PAGE_SIZE, useReportsData } from '../hooks/useReportsData';

export function Reports() {
  const {
    error,
    isModalOpen,
    loading,
    onCloseModal,
    onCreateReport,
    onOpenModal,
    onPageChange,
    page,
    reports,
    totalCount,
    totalPages,
  } = useReportsData();

  return (
    <>
      <PageLayout>
        <div className="mb-4 flex items-center justify-end">
          <Button onClick={onOpenModal}>Create Report</Button>
        </div>

        <ReportList
          error={error}
          loading={loading}
          onCreateReport={onOpenModal}
          reports={reports}
        />

        {!loading && !error && totalCount > 0 && (
          <Pagination
            itemCount={reports.length}
            page={page}
            pageSize={PAGE_SIZE}
            totalCount={totalCount}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
      </PageLayout>

      <CreateReportModal
        isOpen={isModalOpen}
        onClose={onCloseModal}
        onSubmit={onCreateReport}
      />
    </>
  );
}
