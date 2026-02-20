import { Transaction } from './transaction';

export interface Report {
  id: string;
  title: string;
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
