import { useEffect } from 'react';

import { BillingCycle, Subscription } from '../../types/subscription';
import { Button, Modal } from '../ui';
import { SubscriptionFormFields } from './SubscriptionFormFields';
import { useSubscriptionForm } from './useSubscriptionForm';

interface EditSubscriptionModalProps {
  existingNames?: Array<string>;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: {
    amount: number;
    billingCycle: BillingCycle;
    endDate?: string;
    id: string;
    name: string;
    notes?: string;
    paymentMethod?: string;
    startDate: string;
    trialEndsAt?: string;
    url?: string;
  }) => void;
  subscription: Subscription | null;
}

function formatDateForInput(dateString: string): string {
  const value = /^\d+$/.test(dateString) ? Number(dateString) : dateString;
  const parsed = new Date(value);
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function EditSubscriptionModal({
  existingNames = [],
  isOpen,
  onClose,
  onSubmit,
  subscription,
}: EditSubscriptionModalProps) {
  const { onChange, values } = useSubscriptionForm();

  useEffect(() => {
    if (subscription) {
      const hasTrial = !!subscription.trialEndsAt;
      onChange({
        amount: String(subscription.amount),
        billingCycle: subscription.billingCycle,
        isTrial: hasTrial,
        name: subscription.name,
        notes: subscription.notes ?? '',
        paymentMethod: subscription.paymentMethod ?? '',
        startDate: formatDateForInput(subscription.startDate),
        trialEndsAt: hasTrial
          ? formatDateForInput(subscription.trialEndsAt!)
          : '',
        url: subscription.url ?? '',
      });
    }
  }, [subscription, onChange]);

  const isDuplicate =
    values.name.trim().length > 0 &&
    values.name.trim().toLowerCase() !== subscription?.name.toLowerCase() &&
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

  const defaultExpandAdditional = !!(
    subscription?.url ||
    subscription?.paymentMethod ||
    subscription?.notes
  );

  const handleSubmit = () => {
    if (!isValid || !subscription) {
      return;
    }

    onSubmit({
      amount: parseFloat(values.amount),
      billingCycle: values.billingCycle,
      id: subscription.id,
      name: values.name.trim(),
      notes: values.notes.trim() || undefined,
      paymentMethod: values.paymentMethod.trim() || undefined,
      startDate: values.startDate,
      trialEndsAt: values.isTrial ? values.trialEndsAt : undefined,
      url: values.url.trim() || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Subscription"
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
      <SubscriptionFormFields
        defaultExpandAdditional={defaultExpandAdditional}
        isDuplicate={isDuplicate}
        onChange={onChange}
        values={values}
      />
    </Modal>
  );
}
