import { Transaction } from './transaction';

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
