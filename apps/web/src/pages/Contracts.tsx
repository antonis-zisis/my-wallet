import { ContractList } from '../components/contracts/ContractList';
import { CreateContractModal } from '../components/contracts/CreateContractModal';
import { DeleteContractModal } from '../components/contracts/DeleteContractModal';
import { EditContractModal } from '../components/contracts/EditContractModal';
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
import { CONTRACT_SORT_OPTIONS, ContractSortField } from '../types/contract';

export function Contracts() {
  const {
    contractToDelete,
    contractToEdit,
    error,
    isCreateOpen,
    isDeleting,
    items,
    loading,
    onCloseCreate,
    onCreate,
    onDeleteConfirm,
    onOpenCreate,
    onPaginate,
    onSearchChange,
    onSelectForDelete,
    onSelectForEdit,
    onSortChange,
    onUpdate,
    page,
    search,
    sortBy,
    totalCount,
    totalPages,
  } = useContractsData();

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
          <Button className="self-start" onClick={onOpenCreate}>
            New Contract
          </Button>
        </div>

        {(loading || (!error && (totalCount > 0 || !!search))) && (
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
          error={error}
          isSearching={!!search}
          loading={loading}
          onAdd={onOpenCreate}
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
