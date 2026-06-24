import { Contract } from '../../../types/contract';
import { getDaysUntil } from '../../../utils/getDaysUntil';

export function getDaysUntilExpiration(contract: Contract): number | null {
  if (!contract.endDate) {
    return null;
  }

  return getDaysUntil(contract.endDate);
}
