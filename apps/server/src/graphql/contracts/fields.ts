import { isExpired } from './lib/isExpired';

type ContractParent = {
  endDate: Date | null;
};

export const contractFieldResolvers = {
  isExpired: (parent: ContractParent) => isExpired(parent),
};
