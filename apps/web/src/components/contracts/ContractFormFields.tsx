import type { ContractFormValues } from '../../hooks/contracts/useContractForm';
import {
  CONTRACT_CATEGORY_OPTIONS,
  ContractCategory,
} from '../../types/contract';
import { Input, Select } from '../ui';

type ContractFormFieldsProps = {
  onChange: (updates: Partial<ContractFormValues>) => void;
  values: ContractFormValues;
};

const CATEGORY_OPTIONS = [
  { label: 'Select a category', value: '' },
  ...CONTRACT_CATEGORY_OPTIONS,
];

export function ContractFormFields({
  onChange,
  values,
}: ContractFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input
          autoFocus
          id="contract-provider"
          label="Provider"
          placeholder="e.g. DEI"
          required
          value={values.provider}
          onChange={(event) => onChange({ provider: event.target.value })}
        />
        <Select
          id="contract-category"
          label="Category"
          options={CATEGORY_OPTIONS}
          required
          value={values.category}
          onChange={(event) =>
            onChange({
              category: event.target.value as ContractCategory | '',
            })
          }
        />
      </div>

      {values.category === 'Other' && (
        <Input
          id="contract-custom-category"
          label="Custom category"
          placeholder="e.g. Gym membership"
          value={values.customCategory}
          onChange={(event) => onChange({ customCategory: event.target.value })}
        />
      )}

      <Input
        id="contract-plan"
        label="Plan"
        placeholder="e.g. MyHome Online"
        value={values.plan}
        onChange={(event) => onChange({ plan: event.target.value })}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          id="contract-start-date"
          label="Start Date"
          type="date"
          value={values.startDate}
          onChange={(event) => onChange({ startDate: event.target.value })}
        />
        <Input
          id="contract-end-date"
          label="End Date"
          type="date"
          value={values.endDate}
          onChange={(event) => onChange({ endDate: event.target.value })}
        />
      </div>

      <Input
        id="contract-cost"
        label="Cost (optional)"
        min="0"
        placeholder="e.g. 29.90"
        step="0.01"
        type="number"
        value={values.cost}
        onChange={(event) => onChange({ cost: event.target.value })}
      />
    </div>
  );
}
