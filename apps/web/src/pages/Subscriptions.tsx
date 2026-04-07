import { ChevronDownIcon, ChevronUpIcon } from '../components/icons';
import { CancelSubscriptionModal } from '../components/subscriptions/CancelSubscriptionModal';
import { CreateSubscriptionModal } from '../components/subscriptions/CreateSubscriptionModal';
import { DeleteSubscriptionModal } from '../components/subscriptions/DeleteSubscriptionModal';
import { EditSubscriptionModal } from '../components/subscriptions/EditSubscriptionModal';
import { ResumeSubscriptionModal } from '../components/subscriptions/ResumeSubscriptionModal';
import { SubscriptionCostSummary } from '../components/subscriptions/SubscriptionCostSummary';
import { SubscriptionList } from '../components/subscriptions/SubscriptionList';
import { Button, PageLayout, Pagination } from '../components/ui';
import { PAGE_SIZE, useSubscriptionsData } from '../hooks/useSubscriptionsData';

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

  return (
    <>
      <PageLayout>
        <div className="mb-4 flex items-center justify-end">
          <Button onClick={onOpenCreate}>New Subscription</Button>
        </div>

        {(activeLoading || (!activeError && activeTotalCount > 0)) && (
          <SubscriptionCostSummary
            loading={activeLoading}
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
              className="mb-4 flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={onToggleInactive}
            >
              {showInactive ? (
                <ChevronUpIcon className="h-4 w-4" />
              ) : (
                <ChevronDownIcon className="h-4 w-4" />
              )}
              Inactive Subscriptions ({inactiveTotalCount})
            </button>

            {showInactive && (
              <>
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
              </>
            )}
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
