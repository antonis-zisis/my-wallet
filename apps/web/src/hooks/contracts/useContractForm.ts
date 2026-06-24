import { useCallback, useState } from 'react';

import type { ContractCategory } from '../../types/contract';

export type ContractFormValues = {
  category: ContractCategory | '';
  customCategory: string;
  cost: string;
  endDate: string;
  plan: string;
  provider: string;
  startDate: string;
};

export const DEFAULT_CONTRACT_FORM_VALUES: ContractFormValues = {
  category: '',
  customCategory: '',
  cost: '',
  endDate: '',
  plan: '',
  provider: '',
  startDate: '',
};

export function useContractForm() {
  const [values, setValues] = useState<ContractFormValues>(
    DEFAULT_CONTRACT_FORM_VALUES
  );

  const onChange = useCallback((updates: Partial<ContractFormValues>) => {
    setValues((previous) => ({ ...previous, ...updates }));
  }, []);

  const reset = useCallback(() => setValues(DEFAULT_CONTRACT_FORM_VALUES), []);

  return { onChange, reset, values };
}
