import { useState } from 'react';

import { BillingCycle } from '../../types/subscription';
import { Button, Input, Modal, Select } from '../ui';

interface CreateSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: {
    name: string;
    amount: number;
    billingCycle: BillingCycle;
    startDate: string;
    endDate?: string;
  }) => void;
}

export function CreateSubscriptionModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateSubscriptionModalProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('MONTHLY');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleClose = () => {
    setName('');
    setAmount('');
    setBillingCycle('MONTHLY');
    setStartDate('');
    setEndDate('');
    onClose();
  };

  const isValid =
    name.trim().length > 0 && parseFloat(amount) > 0 && startDate.length > 0;

  const handleSubmit = () => {
    if (!isValid) {
      return;
    }
    onSubmit({
      name: name.trim(),
      amount: parseFloat(amount),
      billingCycle,
      startDate,
      endDate: endDate || undefined,
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
          <Button onClick={handleSubmit} disabled={!isValid}>
            Create
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Name"
          id="subscription-name"
          placeholder="e.g. Netflix"
          value={name}
          onChange={(ev) => setName(ev.target.value)}
          autoFocus
        />
        <Input
          label="Amount"
          id="subscription-amount"
          type="number"
          placeholder="9.99"
          min="0"
          step="0.01"
          value={amount}
          onChange={(ev) => setAmount(ev.target.value)}
        />
        <Select
          label="Billing Cycle"
          id="subscription-billing-cycle"
          value={billingCycle}
          options={[
            { value: 'MONTHLY', label: 'Monthly' },
            { value: 'YEARLY', label: 'Yearly' },
          ]}
          onChange={(ev) => setBillingCycle(ev.target.value as BillingCycle)}
        />
        <Input
          label="Start Date"
          id="subscription-start-date"
          type="date"
          value={startDate}
          onChange={(ev) => setStartDate(ev.target.value)}
        />
      </div>
    </Modal>
  );
}
