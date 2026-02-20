export type NetWorthEntryType = 'ASSET' | 'LIABILITY';

export interface NetWorthEntry {
  id: string;
  type: NetWorthEntryType;
  label: string;
  amount: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface NetWorthSnapshot {
  id: string;
  title: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  entries: Array<NetWorthEntry>;
  createdAt: string;
  updatedAt: string;
}

export interface NetWorthSnapshotsData {
  netWorthSnapshots: {
    items: Array<NetWorthSnapshot>;
    totalCount: number;
  };
}

export const ASSET_CATEGORIES = [
  'Savings',
  'Investments',
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
