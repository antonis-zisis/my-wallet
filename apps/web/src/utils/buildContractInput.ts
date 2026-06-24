import type { ContractFormValues } from '../hooks/contracts/useContractForm';
import type { ContractInput } from '../hooks/contracts/useContractsData';

export function resolveCategory(values: ContractFormValues): string {
  if (values.category === 'Other' && values.customCategory.trim()) {
    return values.customCategory.trim();
  }

  return values.category;
}

export function isContractFormValid(values: ContractFormValues): boolean {
  const hasCategory =
    values.category !== '' &&
    (values.category !== 'Other' || values.customCategory.trim().length > 0);
  const datesOrdered =
    !values.startDate || !values.endDate || values.endDate >= values.startDate;

  return values.provider.trim().length > 0 && hasCategory && datesOrdered;
}

export function buildContractInput(values: ContractFormValues): ContractInput {
  return {
    category: resolveCategory(values),
    provider: values.provider.trim(),
    plan: values.plan.trim() || undefined,
    startDate: values.startDate || undefined,
    endDate: values.endDate || undefined,
    cost: values.cost.length > 0 ? parseFloat(values.cost) : undefined,
  };
}
