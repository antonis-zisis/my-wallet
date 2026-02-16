import { Transaction } from './transaction';

export interface Report {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  transactions?: Transaction[];
}

export interface ReportsData {
  reports: {
    items: Report[];
    totalCount: number;
  };
}
