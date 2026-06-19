import { useEffect, useRef, useState } from 'react';

import { EntryRowDraft } from '../../components/netWorth/NetWorthSnapshotModalEntryRow';
import {
  EntryInput,
  NetWorthEntryType,
  SnapshotFormValues,
} from '../../types/netWorth';
import { dateToTitle } from '../../utils/dateToTitle';
import { todayAsDateInput } from '../../utils/todayAsDateInput';
import { makeEmptyEntryDraft, toEntryDraft } from './selectors/makeEntryDraft';

type UseNetWorthSnapshotFormInput = {
  initialEntries?: Array<EntryInput>;
  initialSnapshotDate?: string;
  initialTitle: string;
  isOpen: boolean;
};

export function useNetWorthSnapshotForm({
  initialEntries,
  initialSnapshotDate,
  initialTitle,
  isOpen,
}: UseNetWorthSnapshotFormInput) {
  const nextKeyRef = useRef(0);

  const buildInitialEntries = (
    entries: Array<EntryInput> | undefined
  ): Array<EntryRowDraft> => {
    if (entries && entries.length > 0) {
      return entries.map((entry) => toEntryDraft(nextKeyRef.current++, entry));
    }

    return [makeEmptyEntryDraft(nextKeyRef.current++, 'ASSET')];
  };

  const defaultDate = initialSnapshotDate ?? todayAsDateInput();
  const defaultTitle = initialTitle || dateToTitle(defaultDate);

  const [title, setTitle] = useState(defaultTitle);
  const [snapshotDate, setSnapshotDate] = useState(defaultDate);
  const [entries, setEntries] = useState<Array<EntryRowDraft>>(() =>
    buildInitialEntries(initialEntries)
  );
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
    setEntries((previous) => [
      makeEmptyEntryDraft(nextKeyRef.current++, type),
      ...previous,
    ]);
  };

  const removeEntry = (key: number) => {
    setEntries((previous) => previous.filter((entry) => entry.key !== key));
  };

  const updateEntry = (
    key: number,
    field: 'category' | 'label' | 'amount' | 'notes',
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

  const toFormValues = (): SnapshotFormValues => ({
    title: title.trim(),
    snapshotDate,
    entries: entries.map((entry) => ({
      type: entry.type,
      label: entry.label.trim(),
      amount: parseFloat(entry.amount),
      category: entry.category,
      notes: entry.notes.trim() || undefined,
    })),
  });

  return {
    addEntry,
    assetEntries,
    entries,
    entriesContainerRef,
    handleDateChange,
    handleTitleChange,
    hasIncompleteEntries,
    hasSomeAmount,
    isValid,
    liabilitiesSectionRef,
    liabilityEntries,
    netWorth,
    removeEntry,
    snapshotDate,
    title,
    toFormValues,
    totalAssets,
    totalLiabilities,
    updateEntry,
  };
}
