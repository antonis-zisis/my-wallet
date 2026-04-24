import { useEffect, useState } from 'react';

import {
  BILLING_CYCLE_OPTIONS,
  BillingCycle,
  Subscription,
} from '../../types/subscription';
import { Button, Input, Modal, Select } from '../ui';

interface EditSubscriptionModalProps {
  existingNames?: Array<string>;
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
    notes?: string;
    paymentMethod?: string;
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
      setNotes(subscription.notes ?? '');
      setPaymentMethod(subscription.paymentMethod ?? '');
      setUrl(subscription.url ?? '');
    }
  }, [subscription]);

  const isDuplicate =
    name.trim().length > 0 &&
    name.trim().toLowerCase() !== subscription?.name.toLowerCase() &&
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
      notes: notes.trim() || undefined,
      paymentMethod: paymentMethod.trim() || undefined,
      url: url.trim() || undefined,
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
        <div>
          <Input
            label="Name"
            id="edit-subscription-name"
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
          options={BILLING_CYCLE_OPTIONS}
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

        <Input
          label="URL"
          id="edit-subscription-url"
          type="url"
          placeholder="https://..."
          value={url}
          onChange={(event) => setUrl(event.target.value)}
        />

        <Input
          label="Payment method"
          id="edit-subscription-payment-method"
          placeholder="e.g. Revolut, Visa *1234"
          value={paymentMethod}
          onChange={(event) => setPaymentMethod(event.target.value)}
        />

        <Input
          label="Notes"
          id="edit-subscription-notes"
          placeholder="e.g. shared with sister"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </div>
    </Modal>
  );
}
