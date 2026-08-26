import { CreateReportModal } from '../components/reports/CreateReportModal';
import { ReportList } from '../components/reports/ReportList';
import {
  Button,
  PageLayout,
  Pagination,
  SearchInput,
  Select,
} from '../components/ui';
import { PAGE_SIZE, useReportsData } from '../hooks/reports/useReportsData';
import { REPORT_SORT_OPTIONS, ReportSortOption } from '../types/report';

export function Reports() {
  const {
    currentUserId,
    error,
    isModalOpen,
    loading,
    onCloseModal,
    onCreateReport,
    onOpenModal,
    onPageChange,
    onSearchChange,
    onSortChange,
    page,
    reports,
    search,
    sortOption,
    totalCount,
    totalPages,
  } = useReportsData();

  return (
    <>
      <PageLayout>
        <div className="mb-4 flex items-center justify-end">
          <Button onClick={onOpenModal}>Create Report</Button>
        </div>

        {(loading || !error) && (totalCount > 0 || !!search) && (
          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <SearchInput
              className="w-full sm:max-w-xs sm:flex-1"
              placeholder="Search reports…"
              value={search}
              onChange={onSearchChange}
            />

            <Select
              className="w-full py-1 text-sm sm:w-44"
              options={REPORT_SORT_OPTIONS}
              value={sortOption}
              onChange={(event) =>
                onSortChange(event.target.value as ReportSortOption)
              }
            />
          </div>
        )}

        <ReportList
          currentUserId={currentUserId}
          error={error}
          isSearching={!!search}
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
