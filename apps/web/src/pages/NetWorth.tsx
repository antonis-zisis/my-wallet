import { type ChartView, NetWorthTrendChart } from '../components/charts';
import { ChevronDownIcon } from '../components/icons';
import { DeleteNetWorthSnapshotModal } from '../components/netWorth/DeleteNetWorthSnapshotModal';
import { NetWorthList } from '../components/netWorth/NetWorthList';
import {
  EntryInput,
  NetWorthSnapshotModal,
} from '../components/netWorth/NetWorthSnapshotModal';
import {
  Button,
  Card,
  PageLayout,
  Pagination,
  Skeleton,
} from '../components/ui';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { PAGE_SIZE, useNetWorthData } from '../hooks/useNetWorthData';
import { NetWorthEntry, NetWorthSnapshot } from '../types/netWorth';

function toEntryInputs(snapshot: NetWorthSnapshot): Array<EntryInput> {
  return snapshot.entries.map((entry: NetWorthEntry) => ({
    type: entry.type,
    category: entry.category,
    label: entry.label,
    amount: entry.amount,
  }));
}

function getModalConfig(
  modalState: ReturnType<typeof useNetWorthData>['modalState']
): {
  initialEntries?: Array<EntryInput>;
  initialTitle?: string;
  modalTitle: string;
  submitLabel: string;
} {
  if (modalState.kind === 'edit') {
    return {
      initialEntries: toEntryInputs(modalState.snapshot),
      initialTitle: modalState.snapshot.title,
      modalTitle: 'Edit Net Worth Snapshot',
      submitLabel: 'Update Snapshot',
    };
  }

  if (modalState.kind === 'duplicate') {
    return {
      initialEntries: toEntryInputs(modalState.source),
      modalTitle: 'Duplicate Net Worth Snapshot',
      submitLabel: 'Save Snapshot',
    };
  }

  return {
    modalTitle: 'New Net Worth Snapshot',
    submitLabel: 'Save Snapshot',
  };
}

export function NetWorth() {
  const [isChartOpen, setIsChartOpen] = useLocalStorage(
    'netWorth.trendChart.isOpen',
    true
  );
  const [chartView, setChartView] = useLocalStorage<ChartView>(
    'netWorth.trendChart.view',
    'netWorth'
  );

  const {
    error,
    isDeleting,
    loading,
    modalState,
    onCloseModal,
    onDeleteConfirm,
    onModalSubmit,
    onOpenCreate,
    onOpenDuplicate,
    onOpenEdit,
    onPageChange,
    onSelectForDelete,
    page,
    snapshotToDelete,
    snapshots,
    totalCount,
    totalPages,
    trendLoading,
    trendSnapshots,
  } = useNetWorthData();

  const modalConfig = getModalConfig(modalState);

  return (
    <>
      <PageLayout>
        <div className="mb-4 flex items-center justify-end">
          <Button onClick={onOpenCreate}>New Snapshot</Button>
        </div>

        {trendLoading ? (
          <Card className="mb-4">
            {isChartOpen ? (
              <Skeleton className="h-76.25 w-full" />
            ) : (
              <div className="flex items-center justify-between">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
            )}
          </Card>
        ) : trendSnapshots.length >= 2 ? (
          <Card className="mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Net Worth Over Time
              </h2>

              <div className="flex items-center gap-2">
                {isChartOpen && (
                  <div className="flex overflow-hidden rounded border border-gray-200 text-xs dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => setChartView('netWorth')}
                      className={`cursor-pointer px-3 py-1.5 font-medium transition-colors ${
                        chartView === 'netWorth'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                      }`}
                    >
                      Net Worth
                    </button>

                    <button
                      type="button"
                      onClick={() => setChartView('breakdown')}
                      className={`cursor-pointer border-l border-gray-200 px-3 py-1.5 font-medium transition-colors dark:border-gray-700 ${
                        chartView === 'breakdown'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                      }`}
                    >
                      Assets & Liabilities
                    </button>
                  </div>
                )}

                <button
                  aria-expanded={isChartOpen}
                  aria-label="Net Worth Over Time"
                  type="button"
                  onClick={() => setIsChartOpen((previous) => !previous)}
                  className="cursor-pointer"
                >
                  <ChevronDownIcon
                    className={`h-5 w-5 text-gray-500 transition-transform duration-300 dark:text-gray-400 ${isChartOpen ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>
            </div>

            <div
              className={`grid transition-all duration-300 ${isChartOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
              <div className="overflow-hidden">
                <div className="mt-4">
                  <NetWorthTrendChart
                    snapshots={trendSnapshots}
                    view={chartView}
                  />
                </div>
              </div>
            </div>
          </Card>
        ) : null}

        <NetWorthList
          error={error}
          loading={loading}
          snapshots={snapshots}
          onDelete={onSelectForDelete}
          onDuplicate={onOpenDuplicate}
          onEdit={onOpenEdit}
        />

        {!loading && !error && totalCount > 0 && (
          <Pagination
            itemCount={snapshots.length}
            page={page}
            pageSize={PAGE_SIZE}
            totalCount={totalCount}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
      </PageLayout>

      <NetWorthSnapshotModal
        initialEntries={modalConfig.initialEntries}
        initialTitle={modalConfig.initialTitle}
        isOpen={modalState.kind !== 'closed'}
        modalTitle={modalConfig.modalTitle}
        submitLabel={modalConfig.submitLabel}
        onClose={onCloseModal}
        onSubmit={onModalSubmit}
      />

      <DeleteNetWorthSnapshotModal
        isDeleting={isDeleting}
        isOpen={!!snapshotToDelete}
        snapshotTitle={snapshotToDelete?.title ?? ''}
        onClose={() => onSelectForDelete(null)}
        onConfirm={onDeleteConfirm}
      />
    </>
  );
}
