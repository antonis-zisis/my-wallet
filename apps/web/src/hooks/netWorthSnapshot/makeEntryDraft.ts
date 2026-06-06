import { EntryRowDraft } from '../../components/netWorth/NetWorthSnapshotModalEntryRow';
import {
  ASSET_CATEGORIES,
  EntryInput,
  LIABILITY_CATEGORIES,
  NetWorthEntryType,
} from '../../types/netWorth';

export function makeEmptyEntryDraft(
  key: number,
  type: NetWorthEntryType
): EntryRowDraft {
  const categories = type === 'ASSET' ? ASSET_CATEGORIES : LIABILITY_CATEGORIES;

  return {
    key,
    type,
    category: categories[0],
    label: '',
    amount: '',
    notes: '',
  };
}

export function toEntryDraft(key: number, entry: EntryInput): EntryRowDraft {
  return {
    key,
    type: entry.type,
    category: entry.category,
    label: entry.label,
    amount: String(entry.amount),
    notes: entry.notes ?? '',
  };
}
