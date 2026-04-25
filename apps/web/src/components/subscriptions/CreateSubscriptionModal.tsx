import { BillingCycle } from '../../types/subscription';
import { Button, Modal } from '../ui';
import { SubscriptionFormFields } from './SubscriptionFormFields';
import { useSubscriptionForm } from './useSubscriptionForm';

interface CreateSubscriptionModalProps {
  existingNames?: Array<string>;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: {
    amount: number;
    billingCycle: BillingCycle;
    endDate?: string;
    name: string;
    notes?: string;
    paymentMethod?: string;
    startDate: string;
    trialEndsAt?: string;
    url?: string;
  }) => void;
}

export function CreateSubscriptionModal({
  existingNames = [],
  isOpen,
  onClose,
  onSubmit,
}: CreateSubscriptionModalProps) {
  const { onChange, reset, values } = useSubscriptionForm();

  const isDuplicate =
    values.name.trim().length > 0 &&
    existingNames.some(
      (existingName) =>
        existingName.toLowerCase() === values.name.trim().toLowerCase()
    );

  const isValid =
    !isDuplicate &&
    values.name.trim().length > 0 &&
    parseFloat(values.amount) >= 0 &&
    values.amount.length > 0 &&
    values.startDate.length > 0 &&
    (!values.isTrial || values.trialEndsAt.length > 0);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!isValid) {
      return;
    }

    onSubmit({
      amount: parseFloat(values.amount),
      billingCycle: values.billingCycle,
      name: values.name.trim(),
      notes: values.notes.trim() || undefined,
      paymentMethod: values.paymentMethod.trim() || undefined,
      startDate: values.startDate,
      trialEndsAt: values.isTrial ? values.trialEndsAt : undefined,
      url: values.url.trim() || undefined,
    });
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="New Subscription"
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
      <SubscriptionFormFields
        isDuplicate={isDuplicate}
        onChange={onChange}
        values={values}
      />
    </Modal>
  );
}
