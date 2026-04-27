import { type ChartView, NetWorthTrendChart } from '../components/charts';
import { ChevronDownIcon, InfoIcon } from '../components/icons';
import { NetWorthList } from '../components/netWorth/NetWorthList';
import { NetWorthSnapshotModal } from '../components/netWorth/NetWorthSnapshotModal';
import {
  Button,
  Card,
  PageLayout,
  Pagination,
  Skeleton,
  Tooltip,
} from '../components/ui';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { PAGE_SIZE, useNetWorthData } from '../hooks/useNetWorthData';

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
    loading,
    modalState,
    onCloseModal,
    onModalSubmit,
    onOpenCreate,
    onPageChange,
    page,
    snapshots,
    totalCount,
    totalPages,
    trendLoading,
    trendSnapshots,
  } = useNetWorthData();

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
              <div className="flex items-center gap-3">
                <Skeleton className="h-7 w-48" />
                <ChevronDownIcon className="text-border ml-auto h-5 w-5" />
              </div>
            )}
          </Card>
        ) : trendSnapshots.length >= 2 ? (
          <Card className="mb-4">
            {isChartOpen ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-text-primary text-lg font-semibold">
                    Net Worth Over Time
                  </h2>

                  <Tooltip content="Shows the 10 most recent snapshots, from oldest to newest.">
                    <InfoIcon className="text-text-tertiary h-4 w-4 cursor-pointer" />
                  </Tooltip>
                </div>

                <div className="flex items-center gap-2">
                  <div className="border-border flex overflow-hidden rounded border text-xs">
                    <button
                      type="button"
                      onClick={() => setChartView('netWorth')}
                      className={`cursor-pointer px-3 py-1.5 font-medium transition-colors ${
                        chartView === 'netWorth'
                          ? 'bg-brand-500 text-white'
                          : 'bg-bg-surface text-text-secondary hover:bg-bg-muted'
                      }`}
                    >
                      Net Worth
                    </button>

                    <button
                      type="button"
                      onClick={() => setChartView('breakdown')}
                      className={`border-border cursor-pointer border-l px-3 py-1.5 font-medium transition-colors ${
                        chartView === 'breakdown'
                          ? 'bg-brand-500 text-white'
                          : 'bg-bg-surface text-text-secondary hover:bg-bg-muted'
                      }`}
                    >
                      Assets & Liabilities
                    </button>
                  </div>

                  <button
                    aria-expanded={true}
                    aria-label="Net Worth Over Time"
                    type="button"
                    onClick={() => setIsChartOpen((previous) => !previous)}
                    className="cursor-pointer"
                  >
                    <ChevronDownIcon className="text-text-secondary h-5 w-5 rotate-180 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex w-full cursor-pointer items-center gap-3">
                <button
                  aria-expanded={false}
                  aria-label="Net Worth Over Time"
                  type="button"
                  className="flex flex-1 items-center gap-1.5"
                  onClick={() => setIsChartOpen((previous) => !previous)}
                >
                  <h2 className="text-text-primary text-lg font-semibold">
                    Net Worth Over Time
                  </h2>
                </button>

                <ChevronDownIcon
                  className="text-text-secondary h-5 w-5 cursor-pointer"
                  onClick={() => setIsChartOpen((previous) => !previous)}
                />
              </div>
            )}

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

        <NetWorthList error={error} loading={loading} snapshots={snapshots} />

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
        isOpen={modalState.kind !== 'closed'}
        modalTitle="New Net Worth Snapshot"
        submitLabel="Save Snapshot"
        onClose={onCloseModal}
        onSubmit={onModalSubmit}
      />
    </>
  );
}
