import { SortOrder } from './sort';
import { Transaction } from './transaction';

export type ReportSortField = 'NEWEST' | 'NET_BALANCE';

export type ReportSortOption = 'NEWEST' | 'NET_HIGH_LOW' | 'NET_LOW_HIGH';

export const REPORT_SORT_CONFIG: Record<
  ReportSortOption,
  { sortBy: ReportSortField; sortOrder: SortOrder }
> = {
  NEWEST: { sortBy: 'NEWEST', sortOrder: 'DESC' },
  NET_HIGH_LOW: { sortBy: 'NET_BALANCE', sortOrder: 'DESC' },
  NET_LOW_HIGH: { sortBy: 'NET_BALANCE', sortOrder: 'ASC' },
};

export const REPORT_SORT_OPTIONS: Array<{
  value: ReportSortOption;
  label: string;
}> = [
  { value: 'NEWEST', label: 'Created At' },
  { value: 'NET_HIGH_LOW', label: 'Net (High–Low)' },
  { value: 'NET_LOW_HIGH', label: 'Net (Low–High)' },
];

export type Report = {
  id: string;
  isLocked: boolean;
  netBalance?: number;
  title: string;
  transactionCount?: number;
  createdAt: string;
  updatedAt: string;
  transactions?: Array<Transaction>;
};

export type ReportsData = {
  reports: {
    items: Array<Report>;
    totalCount: number;
  };
};

export type ReportsSummaryData = {
  reports: {
    items: Array<Report>;
  };
};
