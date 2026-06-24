import { useEffect } from 'react';

import {
  buildContractInput,
  isContractFormValid,
} from '../../hooks/contracts/selectors/buildContractInput';
import { useContractForm } from '../../hooks/contracts/useContractForm';
import type { ContractInput } from '../../hooks/contracts/useContractsData';
import {
  Contract,
  CONTRACT_CATEGORIES,
  ContractCategory,
} from '../../types/contract';
import { formatDateForInput } from '../../utils/formatDateForInput';
import { Button, Modal } from '../ui';
import { ContractFormFields } from './ContractFormFields';

type EditContractModalProps = {
  contract: Contract | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: ContractInput & { id: string }) => void;
};

function isKnownCategory(category: string): category is ContractCategory {
  return (CONTRACT_CATEGORIES as ReadonlyArray<string>).includes(category);
}

export function EditContractModal({
  contract,
  isOpen,
  onClose,
  onSubmit,
}: EditContractModalProps) {
  const { onChange, values } = useContractForm();

  useEffect(() => {
    if (contract) {
      const category = contract.category;
      onChange({
        category: isKnownCategory(category) ? category : 'Other',
        customCategory: isKnownCategory(category) ? '' : category,
        cost: contract.cost === null ? '' : String(contract.cost),
        endDate: contract.endDate ? formatDateForInput(contract.endDate) : '',
        plan: contract.plan ?? '',
        provider: contract.provider,
        startDate: contract.startDate
          ? formatDateForInput(contract.startDate)
          : '',
      });
    }
  }, [contract, onChange]);

  const isValid = isContractFormValid(values);

  const handleSubmit = () => {
    if (!isValid || !contract) {
      return;
    }

    onSubmit({ ...buildContractInput(values), id: contract.id });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Contract"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!isValid} onClick={handleSubmit}>
            Save
          </Button>
        </>
      }
    >
      <ContractFormFields onChange={onChange} values={values} />
    </Modal>
  );
}
