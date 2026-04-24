import { useEffect, useRef, useState } from 'react';

import {
  ASSET_CATEGORIES,
  LIABILITY_CATEGORIES,
  NetWorthEntryType,
} from '../../types/netWorth';
import { formatMoney } from '../../utils/formatMoney';
import { XMarkIcon } from '../icons';
import { Button, Input, Modal, Select } from '../ui';

interface EntryDraft {
  key: number;
  type: NetWorthEntryType;
  category: string;
  label: string;
  amount: string;
}

export interface EntryInput {
  type: NetWorthEntryType;
  category: string;
  label: string;
  amount: number;
}

export interface SnapshotFormValues {
  title: string;
  snapshotDate: string;
  entries: Array<EntryInput>;
}

interface NetWorthSnapshotModalProps {
  initialEntries?: Array<EntryInput>;
  initialSnapshotDate?: string;
  initialTitle?: string;
  isOpen: boolean;
  modalTitle: string;
  onClose: () => void;
  onSubmit: (input: SnapshotFormValues) => Promise<void>;
  submitLabel: string;
}

function todayAsDateInput(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateToTitle(dateString: string): string {
  const [year, month] = dateString.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

let nextKey = 0;

function makeEntry(type: NetWorthEntryType = 'ASSET'): EntryDraft {
  const categories = type === 'ASSET' ? ASSET_CATEGORIES : LIABILITY_CATEGORIES;
  return {
    key: nextKey++,
    type,
    category: categories[0],
    label: '',
    amount: '',
  };
}

function toDraft(entry: EntryInput): EntryDraft {
  return {
    key: nextKey++,
    type: entry.type,
    category: entry.category,
    label: entry.label,
    amount: String(entry.amount),
  };
}

function buildInitialEntries(
  initialEntries: Array<EntryInput> | undefined
): Array<EntryDraft> {
  if (initialEntries && initialEntries.length > 0) {
    return initialEntries.map(toDraft);
  }
  return [makeEntry('ASSET')];
}

export function NetWorthSnapshotModal({
  initialEntries,
  initialSnapshotDate,
  initialTitle = '',
  isOpen,
  modalTitle,
  onClose,
  onSubmit,
  submitLabel,
}: NetWorthSnapshotModalProps) {
  const defaultDate = initialSnapshotDate ?? todayAsDateInput();
  const defaultTitle = initialTitle || dateToTitle(defaultDate);

  const [title, setTitle] = useState(defaultTitle);
  const [snapshotDate, setSnapshotDate] = useState(defaultDate);
  const [entries, setEntries] = useState<Array<EntryDraft>>(() =>
    buildInitialEntries(initialEntries)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isTitleAutoRef = useRef(true);
  const entriesContainerRef = useRef<HTMLDivElement>(null);
  const liabilitiesSectionRef = useRef<HTMLDivElement>(null);
  const lastAddedTypeRef = useRef<NetWorthEntryType | null>(null);
  const prevEntriesLengthRef = useRef(entries.length);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const date = initialSnapshotDate ?? todayAsDateInput();
    const autoTitle = dateToTitle(date);
    const resolvedTitle = initialTitle || autoTitle;
    setTitle(resolvedTitle);
    setSnapshotDate(date);
    setEntries(buildInitialEntries(initialEntries));
    isTitleAutoRef.current = !initialTitle;
  }, [isOpen, initialTitle, initialSnapshotDate, initialEntries]);

  useEffect(() => {
    if (
      entries.length > prevEntriesLengthRef.current &&
      entriesContainerRef.current
    ) {
      const container = entriesContainerRef.current;
      if (
        lastAddedTypeRef.current === 'LIABILITY' &&
        liabilitiesSectionRef.current
      ) {
        const containerTop = container.getBoundingClientRect().top;
        const sectionTop =
          liabilitiesSectionRef.current.getBoundingClientRect().top;
        container.scrollTop += sectionTop - containerTop;
      } else {
        container.scrollTop = 0;
      }
    }
    prevEntriesLengthRef.current = entries.length;
  }, [entries.length]);

  const handleDateChange = (newDate: string) => {
    if (isTitleAutoRef.current) {
      setTitle(dateToTitle(newDate));
    }

    setSnapshotDate(newDate);
  };

  const handleTitleChange = (value: string) => {
    isTitleAutoRef.current = false;
    setTitle(value);
  };

  const addEntry = (type: NetWorthEntryType) => {
    lastAddedTypeRef.current = type;
    setEntries((previous) => [makeEntry(type), ...previous]);
  };

  const removeEntry = (key: number) => {
    setEntries((previous) => previous.filter((entry) => entry.key !== key));
  };

  const updateEntry = (
    key: number,
    field: keyof Omit<EntryDraft, 'key' | 'type'>,
    value: string
  ) => {
    setEntries((previous) =>
      previous.map((entry) => {
        if (entry.key !== key) {
          return entry;
        }
        return { ...entry, [field]: value };
      })
    );
  };

  const assetEntries = entries.filter((entry) => entry.type === 'ASSET');
  const liabilityEntries = entries.filter(
    (entry) => entry.type === 'LIABILITY'
  );

  const totalAssets = assetEntries.reduce(
    (sum, entry) => sum + (parseFloat(entry.amount) || 0),
    0
  );
  const totalLiabilities = liabilityEntries.reduce(
    (sum, entry) => sum + (parseFloat(entry.amount) || 0),
    0
  );
  const netWorth = totalAssets - totalLiabilities;

  const hasSomeAmount = entries.some((entry) => parseFloat(entry.amount) > 0);
  const hasIncompleteEntries = entries.some(
    (entry) => !entry.label.trim() || !(parseFloat(entry.amount) > 0)
  );

  const isValid =
    title.trim().length > 0 &&
    snapshotDate.length > 0 &&
    entries.length > 0 &&
    !hasIncompleteEntries;

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        title: title.trim(),
        snapshotDate,
        entries: entries.map((entry) => ({
          type: entry.type,
          label: entry.label.trim(),
          amount: parseFloat(entry.amount),
          category: entry.category,
        })),
      });
    } catch {
      // error handling is the caller's responsibility
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderEntryRow = (entry: EntryDraft) => {
    const categoryOptions = (
      entry.type === 'ASSET' ? ASSET_CATEGORIES : LIABILITY_CATEGORIES
    ).map((cat) => ({ value: cat, label: cat }));

    return (
      <div
        key={entry.key}
        className="grid grid-cols-[144px_1fr_112px_28px] items-center gap-2 border-b border-gray-100 py-1 last:border-0 dark:border-gray-700/50"
      >
        <Select
          id={`category-${entry.key}`}
          value={entry.category}
          options={categoryOptions}
          onChange={(event) =>
            updateEntry(entry.key, 'category', event.target.value)
          }
          className="py-1! text-sm"
        />

        <Input
          id={`label-${entry.key}`}
          placeholder="e.g. Savings Account"
          value={entry.label}
          onChange={(event) =>
            updateEntry(entry.key, 'label', event.target.value)
          }
          className="py-1! text-sm"
        />

        <Input
          id={`amount-${entry.key}`}
          type="number"
          placeholder="0.00"
          min="0"
          step="0.01"
          value={entry.amount}
          onChange={(event) =>
            updateEntry(entry.key, 'amount', event.target.value)
          }
          className="py-1! text-sm"
        />

        <button
          onClick={() => removeEntry(entry.key)}
          className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded text-gray-400 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30 dark:text-gray-500 dark:hover:text-red-400"
          aria-label="Remove entry"
          disabled={entries.length === 1}
        >
          <XMarkIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  };

  const renderSectionHeader = (
    label: string,
    type: NetWorthEntryType,
    ref?: React.RefObject<HTMLDivElement | null>
  ) => (
    <div ref={ref} className="flex items-center gap-2 py-1.5">
      <span className="text-xs font-semibold tracking-wide text-gray-400 uppercase dark:text-gray-500">
        {label}
      </span>
      <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
      <button
        className="cursor-pointer text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
        onClick={() => addEntry(type)}
      >
        + Add
      </button>
    </div>
  );

  return (
    <Modal
      closeOnBackdropClick={false}
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={!isValid}
            isLoading={isSubmitting}
          >
            {submitLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="grid grid-cols-[1fr_160px] gap-2">
          <Input
            label="Snapshot Title"
            id="snapshot-title"
            placeholder="e.g. February 2026"
            value={title}
            onChange={(event) => handleTitleChange(event.target.value)}
            className="py-1! text-sm"
            autoFocus
          />

          <Input
            label="Date"
            id="snapshot-date"
            type="date"
            value={snapshotDate}
            onChange={(event) => handleDateChange(event.target.value)}
            className="py-1! text-sm"
          />
        </div>

        <div>
          <div
            ref={entriesContainerRef}
            className="max-h-96 overflow-y-auto pr-1"
          >
            {renderSectionHeader('Assets', 'ASSET')}
            {assetEntries.length === 0 ? (
              <p className="py-1 text-xs text-gray-400 dark:text-gray-500">
                No assets added yet.
              </p>
            ) : (
              assetEntries.map(renderEntryRow)
            )}

            {renderSectionHeader(
              'Liabilities',
              'LIABILITY',
              liabilitiesSectionRef
            )}
            {liabilityEntries.length === 0 ? (
              <p className="py-1 text-xs text-gray-400 dark:text-gray-500">
                No liabilities added yet.
              </p>
            ) : (
              liabilityEntries.map(renderEntryRow)
            )}
          </div>

          {hasIncompleteEntries && hasSomeAmount && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              All entries need a label and an amount greater than zero.
            </p>
          )}
        </div>

        {hasSomeAmount && (
          <div className="flex justify-between border-t border-gray-100 pt-2 text-xs dark:border-gray-700">
            <span className="text-green-600 dark:text-green-400">
              Assets: {formatMoney(totalAssets)} €
            </span>

            <span className="text-red-600 dark:text-red-400">
              Liabilities: {formatMoney(totalLiabilities)} €
            </span>

            <span
              className={`font-semibold ${
                netWorth >= 0
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-red-700 dark:text-red-300'
              }`}
            >
              Net Worth: {netWorth >= 0 ? '' : '-'}
              {formatMoney(Math.abs(netWorth))} €
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
}
