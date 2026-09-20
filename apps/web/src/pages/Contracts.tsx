import { ContractList } from '../components/contracts/ContractList';
import { CreateContractModal } from '../components/contracts/CreateContractModal';
import { DeleteContractModal } from '../components/contracts/DeleteContractModal';
import { EditContractModal } from '../components/contracts/EditContractModal';
import { ExpiredContractsSection } from '../components/contracts/ExpiredContractsSection';
import { PlanUsageHint } from '../components/plan/PlanUsageHint';
import {
  Button,
  PageLayout,
  Pagination,
  SearchInput,
  Select,
} from '../components/ui';
import {
  PAGE_SIZE,
  useContractsData,
} from '../hooks/contracts/useContractsData';
import { useOpenOnParam } from '../hooks/useOpenOnParam';
import { CONTRACT_SORT_OPTIONS, ContractSortField } from '../types/contract';

export function Contracts() {
  const {
    contractToDelete,
    contractToEdit,
    error,
    expiredError,
    expiredItems,
    expiredLoading,
    expiredPage,
    expiredTotalCount,
    expiredTotalPages,
    hasOnlyExpiredContracts,
    isCreateOpen,
    isDeleting,
    isExpiredCollapsible,
    isExpiredOpen,
    items,
    loading,
    onCloseCreate,
    onCreate,
    onDeleteConfirm,
    onExpiredPaginate,
    onOpenCreate,
    onPaginate,
    onSearchChange,
    onSelectForDelete,
    onSelectForEdit,
    onSortChange,
    onToggleExpired,
    onUpdate,
    page,
    search,
    sortBy,
    totalCount,
    totalPages,
  } = useContractsData();

  useOpenOnParam(onOpenCreate);

  return (
    <>
      <PageLayout>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div>
            <h1 className="text-text-primary text-2xl font-semibold">
              Contracts
            </h1>
            <p className="text-text-secondary mt-1 text-sm">
              Track your service contracts and when they expire.
            </p>
          </div>
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <Button className="self-start" onClick={onOpenCreate}>
              New Contract
            </Button>

            <PlanUsageHint limit="maxContracts" />
          </div>
        </div>

        {(loading ||
          (!error &&
            (totalCount > 0 || expiredTotalCount > 0 || !!search))) && (
          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <SearchInput
              className="w-full sm:max-w-xs sm:flex-1"
              placeholder="Search by provider…"
              value={search}
              onChange={onSearchChange}
            />

            <Select
              className="w-full py-1 text-sm sm:w-40"
              options={CONTRACT_SORT_OPTIONS}
              value={sortBy}
              onChange={(event) =>
                onSortChange(event.target.value as ContractSortField)
              }
            />
          </div>
        )}

        <ContractList
          contracts={items}
          emptyMessage={
            hasOnlyExpiredContracts ? 'No active contracts.' : undefined
          }
          error={error}
          isSearching={!!search}
          loading={loading}
          onAdd={hasOnlyExpiredContracts ? undefined : onOpenCreate}
          onDelete={onSelectForDelete}
          onEdit={onSelectForEdit}
        />

        {!loading && !error && totalCount > 0 && (
          <Pagination
            itemCount={items.length}
            page={page}
            pageSize={PAGE_SIZE}
            totalCount={totalCount}
            totalPages={totalPages}
            onPageChange={onPaginate}
          />
        )}

        {!expiredLoading && expiredTotalCount > 0 && (
          <ExpiredContractsSection
            contracts={expiredItems}
            error={expiredError}
            isCollapsible={isExpiredCollapsible}
            isOpen={isExpiredOpen}
            loading={expiredLoading}
            page={expiredPage}
            pageSize={PAGE_SIZE}
            totalCount={expiredTotalCount}
            totalPages={expiredTotalPages}
            onDelete={onSelectForDelete}
            onEdit={onSelectForEdit}
            onPageChange={onExpiredPaginate}
            onToggle={onToggleExpired}
          />
        )}
      </PageLayout>

      <CreateContractModal
        isOpen={isCreateOpen}
        onClose={onCloseCreate}
        onSubmit={onCreate}
      />

      <EditContractModal
        contract={contractToEdit}
        isOpen={!!contractToEdit}
        onClose={() => onSelectForEdit(null)}
        onSubmit={onUpdate}
      />

      <DeleteContractModal
        contractName={contractToDelete?.provider ?? ''}
        isDeleting={isDeleting}
        isOpen={!!contractToDelete}
        onClose={() => onSelectForDelete(null)}
        onConfirm={onDeleteConfirm}
      />
    </>
  );
}
