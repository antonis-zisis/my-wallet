import { ChevronLeftIcon, ChevronRightIcon } from '../icons';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  itemCount: number;
  onPageChange: (newPage: number) => void;
}

const iconButtonClass =
  'rounded cursor-pointer p-1.5 text-text-secondary transition-colors hover:bg-bg-muted disabled:cursor-not-allowed disabled:opacity-50';

export function Pagination({
  itemCount,
  onPageChange,
  page,
  pageSize,
  totalCount,
  totalPages,
}: PaginationProps) {
  const startItem = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = (page - 1) * pageSize + itemCount;

  return (
    <div className="mt-3 flex items-center justify-end gap-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className={iconButtonClass}
      >
        <ChevronLeftIcon className="size-4" />
      </button>

      <span className="text-text-secondary text-xs">
        Showing {startItem} - {endItem} of {totalCount}
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className={iconButtonClass}
      >
        <ChevronRightIcon className="size-4" />
      </button>
    </div>
  );
}
