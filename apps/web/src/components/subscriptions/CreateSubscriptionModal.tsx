import { useState } from 'react';

import { BILLING_CYCLE_OPTIONS, BillingCycle } from '../../types/subscription';
import { Button, Input, Modal, Select } from '../ui';

interface CreateSubscriptionModalProps {
  existingNames?: Array<string>;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: {
    name: string;
    amount: number;
    billingCycle: BillingCycle;
    startDate: string;
    endDate?: string;
    trialEndsAt?: string;
    notes?: string;
    paymentMethod?: string;
    url?: string;
  }) => void;
}

export function CreateSubscriptionModal({
  existingNames = [],
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
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [url, setUrl] = useState('');

  const handleClose = () => {
    setName('');
    setAmount('');
    setBillingCycle('MONTHLY');
    setStartDate('');
    setEndDate('');
    setIsTrial(false);
    setTrialEndsAt('');
    setNotes('');
    setPaymentMethod('');
    setUrl('');
    onClose();
  };

  const isDuplicate =
    name.trim().length > 0 &&
    existingNames.some(
      (existingName) => existingName.toLowerCase() === name.trim().toLowerCase()
    );

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
      notes: notes.trim() || undefined,
      paymentMethod: paymentMethod.trim() || undefined,
      url: url.trim() || undefined,
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
        <div>
          <Input
            label="Name"
            id="subscription-name"
            placeholder="e.g. Netflix"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
          />
          {isDuplicate && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              A subscription with this name already exists.
            </p>
          )}
        </div>

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
          options={BILLING_CYCLE_OPTIONS}
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

        <Input
          label="URL"
          id="subscription-url"
          type="url"
          placeholder="https://..."
          value={url}
          onChange={(event) => setUrl(event.target.value)}
        />

        <Input
          label="Payment method"
          id="subscription-payment-method"
          placeholder="e.g. Revolut, Visa *1234"
          value={paymentMethod}
          onChange={(event) => setPaymentMethod(event.target.value)}
        />

        <Input
          label="Notes"
          id="subscription-notes"
          placeholder="e.g. shared with sister"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </div>
    </Modal>
  );
}
