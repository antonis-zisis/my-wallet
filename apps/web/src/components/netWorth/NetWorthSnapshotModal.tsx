import { useState } from 'react';

import { useNetWorthSnapshotForm } from '../../hooks/netWorthSnapshot/useNetWorthSnapshotForm';
import { EntryInput, SnapshotFormValues } from '../../types/netWorth';
import { Button, Input, Modal } from '../ui';
import { NetWorthSnapshotModalEntryRow } from './NetWorthSnapshotModalEntryRow';
import { NetWorthSnapshotModalSectionHeader } from './NetWorthSnapshotModalSectionHeader';
import { NetWorthSnapshotModalSummary } from './NetWorthSnapshotModalSummary';

export type { EntryInput, SnapshotFormValues } from '../../types/netWorth';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useNetWorthSnapshotForm({
    initialEntries,
    initialSnapshotDate,
    initialTitle,
    isOpen,
  });

  const handleSubmit = async () => {
    if (!form.isValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(form.toFormValues());
    } catch {
      // error handling is the caller's responsibility
    } finally {
      setIsSubmitting(false);
    }
  };

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
            disabled={!form.isValid}
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
            value={form.title}
            onChange={(event) => form.handleTitleChange(event.target.value)}
            className="py-1! text-sm"
            autoFocus
          />

          <Input
            label="Date"
            id="snapshot-date"
            type="date"
            value={form.snapshotDate}
            onChange={(event) => form.handleDateChange(event.target.value)}
            className="py-1! text-sm"
          />
        </div>

        <div>
          <div
            ref={form.entriesContainerRef}
            className="max-h-96 overflow-y-auto pr-1"
          >
            <NetWorthSnapshotModalSectionHeader
              label="Assets"
              onAdd={() => form.addEntry('ASSET')}
            />
            {form.assetEntries.length === 0 ? (
              <p className="text-text-tertiary py-1 text-xs">
                No assets added yet.
              </p>
            ) : (
              form.assetEntries.map((entry) => (
                <NetWorthSnapshotModalEntryRow
                  key={entry.key}
                  entry={entry}
                  isOnlyEntry={form.entries.length === 1}
                  onRemove={() => form.removeEntry(entry.key)}
                  onUpdate={(field, value) =>
                    form.updateEntry(entry.key, field, value)
                  }
                />
              ))
            )}

            <NetWorthSnapshotModalSectionHeader
              containerRef={form.liabilitiesSectionRef}
              label="Liabilities"
              onAdd={() => form.addEntry('LIABILITY')}
            />
            {form.liabilityEntries.length === 0 ? (
              <p className="text-text-tertiary py-1 text-xs">
                No liabilities added yet.
              </p>
            ) : (
              form.liabilityEntries.map((entry) => (
                <NetWorthSnapshotModalEntryRow
                  key={entry.key}
                  entry={entry}
                  isOnlyEntry={form.entries.length === 1}
                  onRemove={() => form.removeEntry(entry.key)}
                  onUpdate={(field, value) =>
                    form.updateEntry(entry.key, field, value)
                  }
                />
              ))
            )}
          </div>

          {form.hasIncompleteEntries && form.hasSomeAmount && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              All entries need a label and an amount greater than zero.
            </p>
          )}
        </div>

        {form.hasSomeAmount && (
          <NetWorthSnapshotModalSummary
            netWorth={form.netWorth}
            totalAssets={form.totalAssets}
            totalLiabilities={form.totalLiabilities}
          />
        )}
      </div>
    </Modal>
  );
}
