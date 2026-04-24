import { ChevronDownIcon } from '../components/icons';
import { CancelSubscriptionModal } from '../components/subscriptions/CancelSubscriptionModal';
import { CreateSubscriptionModal } from '../components/subscriptions/CreateSubscriptionModal';
import { DeleteSubscriptionModal } from '../components/subscriptions/DeleteSubscriptionModal';
import { EditSubscriptionModal } from '../components/subscriptions/EditSubscriptionModal';
import { ResumeSubscriptionModal } from '../components/subscriptions/ResumeSubscriptionModal';
import { SubscriptionCostSummary } from '../components/subscriptions/SubscriptionCostSummary';
import { SubscriptionList } from '../components/subscriptions/SubscriptionList';
import { Button, PageLayout, Pagination } from '../components/ui';
import { PAGE_SIZE, useSubscriptionsData } from '../hooks/useSubscriptionsData';
import { getDaysUntil } from '../utils/getDaysUntil';

const INACTIVE_SECTION_ID = 'inactive-subscriptions-section';

function buildSubtitle(
  activeTotalCount: number,
  nextRenewalDate: Date | null
): string {
  if (activeTotalCount === 0) {
    return 'Track recurring payments in one place.';
  }

  const subscriptionWord =
    activeTotalCount === 1 ? 'subscription' : 'subscriptions';
  const activeLabel = `${activeTotalCount} active ${subscriptionWord}`;

  if (!nextRenewalDate) {
    return activeLabel;
  }

  const daysUntil = getDaysUntil(nextRenewalDate);

  if (daysUntil <= 0) {
    return `${activeLabel} · next renewal today`;
  }

  if (daysUntil === 1) {
    return `${activeLabel} · next renewal tomorrow`;
  }

  return `${activeLabel} · next renewal in ${daysUntil} days`;
}

export function Subscriptions() {
  const {
    activeError,
    activeItems,
    activeLoading,
    activePage,
    activeTotalCount,
    activeTotalPages,
    inactiveError,
    inactiveItems,
    inactiveLoading,
    inactivePage,
    inactiveTotalCount,
    inactiveTotalPages,
    isCancelling,
    isCreateOpen,
    isDeleting,
    isResuming,
    nextRenewal,
    onActivePaginate,
    onCancelConfirm,
    onCloseCreate,
    onCreate,
    onDeleteConfirm,
    onInactivePaginate,
    onOpenCreate,
    onResumeActive,
    onResumeFromInactive,
    onSelectForCancel,
    onSelectForDelete,
    onSelectForEdit,
    onSelectForResume,
    onToggleInactive,
    onUpdate,
    showInactive,
    subscriptionToCancel,
    subscriptionToDelete,
    subscriptionToEdit,
    subscriptionToResume,
    totalMonthlyCost,
    totalYearlyCost,
  } = useSubscriptionsData();

  const subtitle = activeLoading
    ? 'Track recurring payments in one place.'
    : buildSubtitle(activeTotalCount, nextRenewal?.date ?? null);

  return (
    <>
      <PageLayout>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Subscriptions
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          </div>
          <Button onClick={onOpenCreate}>New Subscription</Button>
        </div>

        {(activeLoading || (!activeError && activeTotalCount > 0)) && (
          <SubscriptionCostSummary
            activeCount={activeTotalCount}
            loading={activeLoading}
            nextRenewal={nextRenewal}
            totalMonthlyCost={totalMonthlyCost}
            totalYearlyCost={totalYearlyCost}
          />
        )}

        <SubscriptionList
          error={activeError}
          loading={activeLoading}
          subscriptions={activeItems}
          emptyMessage="No active subscriptions yet."
          onAdd={onOpenCreate}
          onCancel={onSelectForCancel}
          onDelete={onSelectForDelete}
          onEdit={onSelectForEdit}
          onResume={onResumeActive}
        />

        {!activeLoading && !activeError && activeTotalCount > 0 && (
          <Pagination
            itemCount={activeItems.length}
            page={activePage}
            pageSize={PAGE_SIZE}
            totalCount={activeTotalCount}
            totalPages={activeTotalPages}
            onPageChange={onActivePaginate}
          />
        )}

        {!inactiveLoading && inactiveTotalCount > 0 && (
          <div className="mt-8">
            <button
              aria-controls={INACTIVE_SECTION_ID}
              aria-expanded={showInactive}
              className="mb-4 flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              type="button"
              onClick={onToggleInactive}
            >
              <ChevronDownIcon
                className={`h-4 w-4 transition-transform duration-200 ${showInactive ? 'rotate-180' : ''}`}
              />
              Inactive Subscriptions ({inactiveTotalCount})
            </button>

            <div
              id={INACTIVE_SECTION_ID}
              aria-hidden={!showInactive}
              className={`grid transition-all duration-300 ${showInactive ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
              <div className="overflow-hidden">
                <SubscriptionList
                  error={inactiveError}
                  loading={inactiveLoading}
                  subscriptions={inactiveItems}
                  emptyMessage="No inactive subscriptions."
                  onDelete={onSelectForDelete}
                  onResume={onSelectForResume}
                />

                {!inactiveLoading &&
                  !inactiveError &&
                  inactiveTotalCount > 0 && (
                    <Pagination
                      itemCount={inactiveItems.length}
                      page={inactivePage}
                      pageSize={PAGE_SIZE}
                      totalCount={inactiveTotalCount}
                      totalPages={inactiveTotalPages}
                      onPageChange={onInactivePaginate}
                    />
                  )}
              </div>
            </div>
          </div>
        )}
      </PageLayout>

      <CreateSubscriptionModal
        isOpen={isCreateOpen}
        onClose={onCloseCreate}
        onSubmit={onCreate}
      />

      <EditSubscriptionModal
        isOpen={!!subscriptionToEdit}
        subscription={subscriptionToEdit}
        onClose={() => onSelectForEdit(null)}
        onSubmit={onUpdate}
      />

      <CancelSubscriptionModal
        isCancelling={isCancelling}
        isOpen={!!subscriptionToCancel}
        subscriptionName={subscriptionToCancel?.name ?? ''}
        onClose={() => onSelectForCancel(null)}
        onConfirm={onCancelConfirm}
      />

      <DeleteSubscriptionModal
        isDeleting={isDeleting}
        isOpen={!!subscriptionToDelete}
        subscriptionName={subscriptionToDelete?.name ?? ''}
        onClose={() => onSelectForDelete(null)}
        onConfirm={onDeleteConfirm}
      />

      <ResumeSubscriptionModal
        isOpen={!!subscriptionToResume}
        isResuming={isResuming}
        subscription={subscriptionToResume}
        onClose={() => onSelectForResume(null)}
        onSubmit={onResumeFromInactive}
      />
    </>
  );
}
