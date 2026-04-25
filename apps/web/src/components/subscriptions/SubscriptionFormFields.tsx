import { useState } from 'react';

import { BILLING_CYCLE_OPTIONS, BillingCycle } from '../../types/subscription';
import { Input, Select } from '../ui';
import type { SubscriptionFormValues } from './useSubscriptionForm';

interface SubscriptionFormFieldsProps {
  defaultExpandAdditional?: boolean;
  isDuplicate: boolean;
  onChange: (updates: Partial<SubscriptionFormValues>) => void;
  values: SubscriptionFormValues;
}

export function SubscriptionFormFields({
  defaultExpandAdditional = false,
  isDuplicate,
  onChange,
  values,
}: SubscriptionFormFieldsProps) {
  const [isAdditionalExpanded, setIsAdditionalExpanded] = useState(
    defaultExpandAdditional
  );

  return (
    <div className="space-y-4">
      <div>
        <Input
          autoFocus
          id="subscription-name"
          label="Name"
          placeholder="e.g. Netflix"
          required
          value={values.name}
          onChange={(event) => onChange({ name: event.target.value })}
        />
        {isDuplicate && (
          <p className="mt-1 text-xs text-red-500">
            A subscription with this name already exists.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          id="subscription-amount"
          label="Amount"
          min="0"
          placeholder="9.99"
          required
          step="0.01"
          type="number"
          value={values.amount}
          onChange={(event) => onChange({ amount: event.target.value })}
        />
        <Select
          id="subscription-billing-cycle"
          label="Billing Cycle"
          options={BILLING_CYCLE_OPTIONS}
          required
          value={values.billingCycle}
          onChange={(event) =>
            onChange({ billingCycle: event.target.value as BillingCycle })
          }
        />
      </div>

      <Input
        id="subscription-start-date"
        label="Start Date"
        required
        type="date"
        value={values.startDate}
        onChange={(event) => onChange({ startDate: event.target.value })}
      />

      <div className="space-y-3">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            checked={values.isTrial}
            className="h-4 w-4 rounded border-gray-300 accent-blue-600"
            id="subscription-is-trial"
            type="checkbox"
            onChange={(event) => {
              const checked = event.target.checked;
              onChange({
                isTrial: checked,
                trialEndsAt: checked ? values.trialEndsAt : '',
              });
            }}
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Currently on a free trial
          </span>
        </label>

        <div
          aria-hidden={!values.isTrial}
          className={`grid transition-all duration-300 ${values.isTrial ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
        >
          <div className="overflow-hidden">
            <div className="pt-1 pl-6">
              <Input
                id="subscription-trial-ends-at"
                label="Trial ends"
                type="date"
                value={values.trialEndsAt}
                onChange={(event) =>
                  onChange({ trialEndsAt: event.target.value })
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <button
          className="flex cursor-pointer items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          type="button"
          onClick={() => setIsAdditionalExpanded((previous) => !previous)}
        >
          <svg
            className={`h-4 w-4 transition-transform duration-300 ${isAdditionalExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 9l-7 7-7-7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Additional details
        </button>

        <div
          aria-hidden={!isAdditionalExpanded}
          className={`grid transition-all duration-300 ${isAdditionalExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
        >
          <div className="overflow-hidden">
            <div className="mt-3 space-y-4">
              <Input
                id="subscription-url"
                label="Website or billing URL"
                placeholder="https://..."
                type="url"
                value={values.url}
                onChange={(event) => onChange({ url: event.target.value })}
              />
              <Input
                id="subscription-payment-method"
                label="Payment method"
                placeholder="e.g. Revolut, Visa *1234"
                value={values.paymentMethod}
                onChange={(event) =>
                  onChange({ paymentMethod: event.target.value })
                }
              />
              <Input
                id="subscription-notes"
                label="Notes"
                placeholder="e.g. shared with sister"
                value={values.notes}
                onChange={(event) => onChange({ notes: event.target.value })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
