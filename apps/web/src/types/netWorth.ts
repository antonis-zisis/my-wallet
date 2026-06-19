export type NetWorthEntryType = 'ASSET' | 'LIABILITY';

export type NetWorthEntry = {
  id: string;
  type: NetWorthEntryType;
  label: string;
  amount: number;
  category: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NetWorthSnapshot = {
  id: string;
  title: string;
  snapshotDate: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  entries: Array<NetWorthEntry>;
  previousSnapshot?: NetWorthSnapshot | null;
  createdAt: string;
  updatedAt: string;
};

export type EntryDelta = {
  delta: number;
  isNew: boolean;
};

export type EntryInput = {
  type: NetWorthEntryType;
  category: string;
  label: string;
  amount: number;
  notes?: string;
};

export type SnapshotFormValues = {
  title: string;
  snapshotDate: string;
  entries: Array<EntryInput>;
};

export type NetWorthSnapshotsData = {
  netWorthSnapshots: {
    items: Array<NetWorthSnapshot>;
    totalCount: number;
  };
};

export const ASSET_CATEGORIES = [
  'Savings',
  'Investments',
  'Brokerage',
  'Retirement',
  'Crypto',
  'Real Estate',
  'Vehicle',
  'Other',
] as const;

export const LIABILITY_CATEGORIES = [
  'Mortgage',
  'Car Loan',
  'Student Loan',
  'Credit Card',
  'Personal Loan',
  'Other',
] as const;

export type AssetCategory = (typeof ASSET_CATEGORIES)[number];
export type LiabilityCategory = (typeof LIABILITY_CATEGORIES)[number];
