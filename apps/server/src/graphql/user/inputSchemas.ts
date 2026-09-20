import { z } from 'zod';

import { CURRENCIES, PLANS } from '../../lib/validate';
import { enumField } from '../../lib/validate/fields';

export const UpdateUserInput = z.object({
  fullName: z
    .string()
    .trim()
    .max(255, 'Full name must be 255 characters or fewer')
    .nullish(),
  currency: enumField(CURRENCIES, 'Currency').optional(),
});

export type UpdateUserInput = z.infer<typeof UpdateUserInput>;

export const SelectPlanInput = z.object({
  plan: enumField(PLANS, 'Plan'),
});

export type SelectPlanInput = z.infer<typeof SelectPlanInput>;
