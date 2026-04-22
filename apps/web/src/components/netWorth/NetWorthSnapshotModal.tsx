import { useEffect, useRef, useState } from 'react';

import {
  ASSET_CATEGORIES,
  LIABILITY_CATEGORIES,
  NetWorthEntryType,
} from '../../types/netWorth';
import { formatMoney } from '../../utils/formatMoney';
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
  onSubmit: (input: SnapshotFormValues) => void;
  submitLabel: string;
}

function todayAsDateInput(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
  const [title, setTitle] = useState(initialTitle);
  const [snapshotDate, setSnapshotDate] = useState(
    initialSnapshotDate ?? todayAsDateInput()
  );
  const [entries, setEntries] = useState<Array<EntryDraft>>(() =>
    buildInitialEntries(initialEntries)
  );
  const entriesContainerRef = useRef<HTMLDivElement>(null);
  const prevEntriesLengthRef = useRef(entries.length);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setTitle(initialTitle);
    setSnapshotDate(initialSnapshotDate ?? todayAsDateInput());
    setEntries(buildInitialEntries(initialEntries));
  }, [isOpen, initialTitle, initialSnapshotDate, initialEntries]);

  useEffect(() => {
    if (
      entries.length > prevEntriesLengthRef.current &&
      entriesContainerRef.current
    ) {
      entriesContainerRef.current.scrollTop =
        entriesContainerRef.current.scrollHeight;
    }
    prevEntriesLengthRef.current = entries.length;
  }, [entries.length]);

  const handleClose = () => {
    onClose();
  };

  const addEntry = (type: NetWorthEntryType) => {
    setEntries((prev) => [...prev, makeEntry(type)]);
  };

  const removeEntry = (key: number) => {
    setEntries((prev) => prev.filter((entry) => entry.key !== key));
  };

  const updateEntry = (
    key: number,
    field: keyof Omit<EntryDraft, 'key'>,
    value: string
  ) => {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.key !== key) {
          return entry;
        }

        if (field === 'type') {
          const newType = value as NetWorthEntryType;
          const categories =
            newType === 'ASSET' ? ASSET_CATEGORIES : LIABILITY_CATEGORIES;
          return {
            ...entry,
            type: newType,
            category: categories[0],
          };
        }

        return { ...entry, [field]: value };
      })
    );
  };

  const totalAssets = entries
    .filter((entry) => entry.type === 'ASSET')
    .reduce((sum, entry) => sum + (parseFloat(entry.amount) || 0), 0);

  const totalLiabilities = entries
    .filter((entry) => entry.type === 'LIABILITY')
    .reduce((sum, entry) => sum + (parseFloat(entry.amount) || 0), 0);

  const netWorth = totalAssets - totalLiabilities;

  const isValid =
    title.trim().length > 0 &&
    snapshotDate.length > 0 &&
    entries.length > 0 &&
    entries.every(
      (entry) => entry.label.trim().length > 0 && parseFloat(entry.amount) > 0
    );

  const handleSubmit = () => {
    if (!isValid) {
      return;
    }

    onSubmit({
      title: title.trim(),
      snapshotDate,
      entries: entries.map((entry) => ({
        type: entry.type,
        label: entry.label.trim(),
        amount: parseFloat(entry.amount),
        category: entry.category,
      })),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={modalTitle}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>

          <Button onClick={handleSubmit} disabled={!isValid}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Snapshot Title"
          id="snapshot-title"
          placeholder="e.g. February 2026"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          autoFocus
        />

        <Input
          label="Snapshot Date"
          id="snapshot-date"
          type="date"
          value={snapshotDate}
          onChange={(event) => setSnapshotDate(event.target.value)}
        />

        <div>
          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Entries
          </p>

          <div
            ref={entriesContainerRef}
            className="max-h-72 space-y-2 overflow-y-auto pr-1"
          >
            {entries.map((entry) => {
              const categoryOptions = (
                entry.type === 'ASSET' ? ASSET_CATEGORIES : LIABILITY_CATEGORIES
              ).map((cat) => ({ value: cat, label: cat }));

              return (
                <div
                  key={entry.key}
                  className="flex items-end gap-2 rounded-lg bg-gray-50 p-2 dark:bg-gray-700/50"
                >
                  <div className="w-28 shrink-0">
                    <Select
                      id={`type-${entry.key}`}
                      value={entry.type}
                      options={[
                        { value: 'ASSET', label: 'Asset' },
                        { value: 'LIABILITY', label: 'Liability' },
                      ]}
                      onChange={(event) =>
                        updateEntry(entry.key, 'type', event.target.value)
                      }
                    />
                  </div>

                  <div className="w-36 shrink-0">
                    <Select
                      id={`category-${entry.key}`}
                      value={entry.category}
                      options={categoryOptions}
                      onChange={(event) =>
                        updateEntry(entry.key, 'category', event.target.value)
                      }
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <Input
                      id={`label-${entry.key}`}
                      placeholder="Label"
                      value={entry.label}
                      onChange={(event) =>
                        updateEntry(entry.key, 'label', event.target.value)
                      }
                    />
                  </div>

                  <div className="w-28 shrink-0">
                    <Input
                      id={`amount-${entry.key}`}
                      type="number"
                      placeholder="Amount"
                      min="0"
                      step="0.01"
                      value={entry.amount}
                      onChange={(event) =>
                        updateEntry(entry.key, 'amount', event.target.value)
                      }
                    />
                  </div>

                  <button
                    onClick={() => removeEntry(entry.key)}
                    className="mb-0.5 shrink-0 cursor-pointer p-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                    aria-label="Remove entry"
                    disabled={entries.length === 1}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-2 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => addEntry('ASSET')}
            >
              + Asset
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => addEntry('LIABILITY')}
            >
              + Liability
            </Button>
          </div>
        </div>

        <div className="flex justify-between rounded-lg bg-gray-100 px-4 py-3 text-sm dark:bg-gray-700">
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
      </div>
    </Modal>
  );
}
