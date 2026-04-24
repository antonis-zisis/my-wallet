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
    trialEndsAt?: string;
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
  const [isTrial, setIsTrial] = useState(false);
  const [trialEndsAt, setTrialEndsAt] = useState('');

  const handleClose = () => {
    setName('');
    setAmount('');
    setBillingCycle('MONTHLY');
    setStartDate('');
    setEndDate('');
    setIsTrial(false);
    setTrialEndsAt('');
    onClose();
  };

  const isValid =
    name.trim().length > 0 &&
    parseFloat(amount) >= 0 &&
    amount.length > 0 &&
    startDate.length > 0 &&
    (!isTrial || trialEndsAt.length > 0);

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
      trialEndsAt: isTrial ? trialEndsAt : undefined,
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
          onChange={(event) => setName(event.target.value)}
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
          onChange={(event) => setAmount(event.target.value)}
        />

        <Select
          label="Billing Cycle"
          id="subscription-billing-cycle"
          value={billingCycle}
          options={[
            { value: 'MONTHLY', label: 'Monthly' },
            { value: 'YEARLY', label: 'Yearly' },
          ]}
          onChange={(event) =>
            setBillingCycle(event.target.value as BillingCycle)
          }
        />

        <Input
          label="Start Date"
          id="subscription-start-date"
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
        />

        <label className="flex cursor-pointer items-center gap-2">
          <input
            checked={isTrial}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 accent-blue-600"
            id="subscription-is-trial"
            type="checkbox"
            onChange={(event) => {
              setIsTrial(event.target.checked);
              if (!event.target.checked) {
                setTrialEndsAt('');
              }
            }}
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Trial period
          </span>
        </label>

        {isTrial && (
          <Input
            label="Trial ends"
            id="subscription-trial-ends-at"
            type="date"
            value={trialEndsAt}
            onChange={(event) => setTrialEndsAt(event.target.value)}
          />
        )}
      </div>
    </Modal>
  );
}
