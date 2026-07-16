import { CreateReportModal } from '../components/reports/CreateReportModal';
import { ReportList } from '../components/reports/ReportList';
import { ShareReportModal } from '../components/reports/ShareReportModal';
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
    isLeaving,
    isModalOpen,
    isSharing,
    loading,
    onCloseModal,
    onCloseShareModal,
    onCreateReport,
    onLeaveReport,
    onOpenModal,
    onOpenShareModal,
    onPageChange,
    onSearchChange,
    onShareReport,
    onSortChange,
    onUnshareMember,
    onUpdateMemberRole,
    page,
    reports,
    search,
    sharingReport,
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
          <div className="mb-2 flex items-center justify-between gap-3">
            <SearchInput
              className="max-w-xs flex-1"
              placeholder="Search reports…"
              value={search}
              onChange={onSearchChange}
            />

            <Select
              className="w-44 py-1 text-sm"
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
          onOpenShareModal={onOpenShareModal}
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

      {sharingReport && (
        <ShareReportModal
          currentUserId={currentUserId}
          isLeaving={isLeaving}
          isOpen
          isSharing={isSharing}
          members={sharingReport.members ?? []}
          myRole={sharingReport.myRole ?? 'OWNER'}
          onClose={onCloseShareModal}
          onLeaveReport={onLeaveReport}
          onShareReport={onShareReport}
          onUnshareMember={onUnshareMember}
          onUpdateMemberRole={onUpdateMemberRole}
        />
      )}
    </>
  );
}
