import {
  buildContractInput,
  isContractFormValid,
} from '../../hooks/contracts/selectors/buildContractInput';
import { useContractForm } from '../../hooks/contracts/useContractForm';
import type { ContractInput } from '../../hooks/contracts/useContractsData';
import { Button, Modal } from '../ui';
import { ContractFormFields } from './ContractFormFields';

type CreateContractModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: ContractInput) => void;
};

export function CreateContractModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateContractModalProps) {
  const { onChange, reset, values } = useContractForm();

  const isValid = isContractFormValid(values);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!isValid) {
      return;
    }

    onSubmit(buildContractInput(values));
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="New Contract"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button disabled={!isValid} onClick={handleSubmit}>
            Create
          </Button>
        </>
      }
    >
      <ContractFormFields onChange={onChange} values={values} />
    </Modal>
  );
}
