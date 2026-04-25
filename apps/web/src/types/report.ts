import { Transaction } from './transaction';

export interface Report {
  id: string;
  isLocked: boolean;
  netBalance?: number;
  title: string;
  transactionCount?: number;
  createdAt: string;
  updatedAt: string;
  transactions?: Array<Transaction>;
}

export interface ReportsData {
  reports: {
    items: Array<Report>;
    totalCount: number;
  };
}

export interface ReportsSummaryData {
  reports: {
    items: Array<Report>;
  };
}
