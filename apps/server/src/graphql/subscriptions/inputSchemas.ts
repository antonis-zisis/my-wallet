import { z } from 'zod';

import { BILLING_CYCLES, SUBSCRIPTION_CATEGORIES } from '../../lib/validate';
import {
  amount,
  boundedString,
  date,
  enumField,
  httpUrl,
} from '../../lib/validate/fields';

const billingCycle = enumField(BILLING_CYCLES, 'Billing cycle');

export const SubscriptionInput = z.object({
  name: boundedString('Name', 255),
  amount,
  billingCycle,
  startDate: date,
  endDate: date.nullish(),
  trialEndsAt: date.nullish(),
  category: enumField(SUBSCRIPTION_CATEGORIES, 'Category').nullish(),
  notes: boundedString('Notes', 1000).nullish(),
  paymentMethod: boundedString('Payment method', 255).nullish(),
  url: httpUrl.nullish(),
});

export type SubscriptionInput = z.infer<typeof SubscriptionInput>;

export const ResumeSubscriptionInput = z.object({
  amount: amount.optional(),
  billingCycle: billingCycle.optional(),
  startDate: date.optional(),
});

export type ResumeSubscriptionInput = z.infer<typeof ResumeSubscriptionInput>;
