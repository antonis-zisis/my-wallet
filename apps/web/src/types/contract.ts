export type ContractSortField = 'END_DATE' | 'PROVIDER';

export const CONTRACT_CATEGORIES = [
  'Electricity',
  'Gas',
  'Water',
  'Internet',
  'Mobile',
  'TV',
  'Insurance',
  'Loan/Mortgage',
  'Other',
] as const;

export type ContractCategory = (typeof CONTRACT_CATEGORIES)[number];

export const CONTRACT_CATEGORY_OPTIONS: Array<{
  label: string;
  value: ContractCategory;
}> = CONTRACT_CATEGORIES.map((category) => ({
  label: category,
  value: category,
}));

export type Contract = {
  id: string;
  category: string;
  provider: string;
  plan: string | null;
  startDate: string | null;
  endDate: string | null;
  cost: number | null;
  isExpired: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ContractsData = {
  contracts: {
    items: Array<Contract>;
    totalCount: number;
  };
};
