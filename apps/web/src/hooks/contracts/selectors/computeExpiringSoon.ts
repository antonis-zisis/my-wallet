import { Contract } from '../../../types/contract';
import { getDaysUntilExpiration } from './getDaysUntilExpiration';

export const EXPIRING_SOON_DAYS = 30;

export type ExpiringContract = Contract & { daysUntilExpiration: number };

export function computeExpiringSoon(
  contracts: Array<Contract>
): Array<ExpiringContract> {
  return contracts
    .map((contract) => ({
      ...contract,
      daysUntilExpiration: getDaysUntilExpiration(contract),
    }))
    .filter(
      (contract): contract is ExpiringContract =>
        contract.daysUntilExpiration !== null &&
        contract.daysUntilExpiration >= 0 &&
        contract.daysUntilExpiration <= EXPIRING_SOON_DAYS
    )
    .sort(
      (left, right) => left.daysUntilExpiration - right.daysUntilExpiration
    );
}
