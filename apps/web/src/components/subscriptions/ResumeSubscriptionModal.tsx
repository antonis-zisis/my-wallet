import { useEffect, useState } from 'react';

import {
  BILLING_CYCLE_OPTIONS,
  BillingCycle,
  Subscription,
} from '../../types/subscription';
import { Button, Input, Modal, Select } from '../ui';

interface ResumeSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: {
    id: string;
    startDate: string;
    amount: number;
    billingCycle: BillingCycle;
  }) => void;
  subscription: Subscription | null;
  isResuming: boolean;
}

export function ResumeSubscriptionModal({
  isOpen,
  isResuming,
  onClose,
  onSubmit,
  subscription,
}: ResumeSubscriptionModalProps) {
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('MONTHLY');
  const [startDate, setStartDate] = useState('');

  useEffect(() => {
    if (subscription) {
      setAmount(String(subscription.amount));
      setBillingCycle(subscription.billingCycle);
      setStartDate('');
    }
  }, [subscription]);

  const isValid = parseFloat(amount) > 0 && startDate.length > 0;

  const handleSubmit = () => {
    if (!isValid || !subscription) {
      return;
    }

    onSubmit({
      id: subscription.id,
      startDate,
      amount: parseFloat(amount),
      billingCycle,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resume Subscription"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid}
            isLoading={isResuming}
          >
            Resume
          </Button>
        </>
      }
    >
      <p className="text-text-secondary mb-4 text-sm">
        Enter a new start date for{' '}
        <span className="font-semibold">{subscription?.name}</span>. You can
        also update the amount and billing cycle.
      </p>

      <div className="space-y-4">
        <Input
          label="Amount"
          id="resume-subscription-amount"
          type="number"
          placeholder="9.99"
          min="0"
          step="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />

        <Select
          label="Billing Cycle"
          id="resume-subscription-billing-cycle"
          value={billingCycle}
          options={BILLING_CYCLE_OPTIONS}
          onChange={(event) =>
            setBillingCycle(event.target.value as BillingCycle)
          }
        />

        <Input
          label="New Start Date"
          id="resume-subscription-start-date"
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          autoFocus
        />
      </div>
    </Modal>
  );
}
