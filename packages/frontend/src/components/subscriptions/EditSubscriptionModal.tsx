import { useEffect, useState } from 'react';

import { BillingCycle, Subscription } from '../../types/subscription';
import { Button, Input, Modal, Select } from '../ui';

interface EditSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: {
    id: string;
    name: string;
    amount: number;
    billingCycle: BillingCycle;
    startDate: string;
    endDate?: string;
  }) => void;
  subscription: Subscription | null;
}

function formatDateForInput(dateString: string): string {
  return dateString.slice(0, 10);
}

export function EditSubscriptionModal({
  isOpen,
  onClose,
  onSubmit,
  subscription,
}: EditSubscriptionModalProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('MONTHLY');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (subscription) {
      setName(subscription.name);
      setAmount(String(subscription.amount));
      setBillingCycle(subscription.billingCycle);
      setStartDate(formatDateForInput(subscription.startDate));
      setEndDate(
        subscription.endDate ? formatDateForInput(subscription.endDate) : ''
      );
    }
  }, [subscription]);

  const isValid =
    name.trim().length > 0 && parseFloat(amount) > 0 && startDate.length > 0;

  const handleSubmit = () => {
    if (!isValid || !subscription) {
      return;
    }
    onSubmit({
      id: subscription.id,
      name: name.trim(),
      amount: parseFloat(amount),
      billingCycle,
      startDate,
      endDate: endDate || undefined,
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
          <Button onClick={handleSubmit} disabled={!isValid}>
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Name"
          id="edit-subscription-name"
          placeholder="e.g. Netflix"
          value={name}
          onChange={(ev) => setName(ev.target.value)}
          autoFocus
        />
        <Input
          label="Amount"
          id="edit-subscription-amount"
          type="number"
          placeholder="9.99"
          min="0"
          step="0.01"
          value={amount}
          onChange={(ev) => setAmount(ev.target.value)}
        />
        <Select
          label="Billing Cycle"
          id="edit-subscription-billing-cycle"
          value={billingCycle}
          options={[
            { value: 'MONTHLY', label: 'Monthly' },
            { value: 'YEARLY', label: 'Yearly' },
          ]}
          onChange={(ev) => setBillingCycle(ev.target.value as BillingCycle)}
        />
        <Input
          label="Start Date"
          id="edit-subscription-start-date"
          type="date"
          value={startDate}
          onChange={(ev) => setStartDate(ev.target.value)}
        />
        <Input
          label="End Date (optional)"
          id="edit-subscription-end-date"
          type="date"
          value={endDate}
          onChange={(ev) => setEndDate(ev.target.value)}
        />
      </div>
    </Modal>
  );
}
