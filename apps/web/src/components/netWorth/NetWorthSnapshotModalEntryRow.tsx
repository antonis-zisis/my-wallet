import {
  ASSET_CATEGORIES,
  LIABILITY_CATEGORIES,
  NetWorthEntryType,
} from '../../types/netWorth';
import { XMarkIcon } from '../icons';
import { Input, Select } from '../ui';

export interface EntryRowDraft {
  key: number;
  type: NetWorthEntryType;
  category: string;
  label: string;
  amount: string;
  notes: string;
}

type EntryRowField = 'category' | 'label' | 'amount' | 'notes';

interface NetWorthSnapshotModalEntryRowProps {
  entry: EntryRowDraft;
  isOnlyEntry: boolean;
  onRemove: () => void;
  onUpdate: (field: EntryRowField, value: string) => void;
}

export function NetWorthSnapshotModalEntryRow({
  entry,
  isOnlyEntry,
  onRemove,
  onUpdate,
}: NetWorthSnapshotModalEntryRowProps) {
  const categoryOptions = (
    entry.type === 'ASSET' ? ASSET_CATEGORIES : LIABILITY_CATEGORIES
  ).map((category) => ({ value: category, label: category }));

  return (
    <div className="border-border grid grid-cols-[144px_1fr_160px_112px_28px] items-center gap-2 border-b py-1 last:border-0 dark:border-gray-700/50">
      <Select
        id={`category-${entry.key}`}
        value={entry.category}
        options={categoryOptions}
        onChange={(event) => onUpdate('category', event.target.value)}
        className="py-1! text-sm"
      />

      <Input
        id={`label-${entry.key}`}
        placeholder="e.g. Savings Account"
        value={entry.label}
        onChange={(event) => onUpdate('label', event.target.value)}
        className="py-1! text-sm"
      />

      <Input
        id={`notes-${entry.key}`}
        placeholder="e.g. 52 shares"
        value={entry.notes}
        onChange={(event) => onUpdate('notes', event.target.value)}
        className="py-1! text-sm"
      />

      <Input
        id={`amount-${entry.key}`}
        type="number"
        placeholder="0.00"
        min="0"
        step="0.01"
        value={entry.amount}
        onChange={(event) => onUpdate('amount', event.target.value)}
        className="py-1! text-sm"
      />

      <button
        onClick={onRemove}
        className="text-text-tertiary flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:text-red-400"
        aria-label="Remove entry"
        disabled={isOnlyEntry}
      >
        <XMarkIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
