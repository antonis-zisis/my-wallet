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
    trialEndsAt?: string;
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
  const [isTrial, setIsTrial] = useState(false);
  const [trialEndsAt, setTrialEndsAt] = useState('');

  useEffect(() => {
    if (subscription) {
      setName(subscription.name);
      setAmount(String(subscription.amount));
      setBillingCycle(subscription.billingCycle);
      setStartDate(formatDateForInput(subscription.startDate));
      setEndDate(
        subscription.endDate ? formatDateForInput(subscription.endDate) : ''
      );
      const hasTrial = !!subscription.trialEndsAt;
      setIsTrial(hasTrial);
      setTrialEndsAt(
        hasTrial ? formatDateForInput(subscription.trialEndsAt!) : ''
      );
    }
  }, [subscription]);

  const isValid =
    name.trim().length > 0 &&
    parseFloat(amount) >= 0 &&
    amount.length > 0 &&
    startDate.length > 0 &&
    (!isTrial || trialEndsAt.length > 0);

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
      trialEndsAt: isTrial ? trialEndsAt : undefined,
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
          onChange={(event) => setName(event.target.value)}
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
          onChange={(event) => setAmount(event.target.value)}
        />

        <Select
          label="Billing Cycle"
          id="edit-subscription-billing-cycle"
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
          id="edit-subscription-start-date"
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
        />

        <label className="flex cursor-pointer items-center gap-2">
          <input
            checked={isTrial}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 accent-blue-600"
            id="edit-subscription-is-trial"
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
            id="edit-subscription-trial-ends-at"
            type="date"
            value={trialEndsAt}
            onChange={(event) => setTrialEndsAt(event.target.value)}
          />
        )}
      </div>
    </Modal>
  );
}
