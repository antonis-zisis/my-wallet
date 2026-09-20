import { z } from 'zod';

import { BILLING_INTERVALS } from '../../lib/validate';
import { enumField } from '../../lib/validate/fields';

export const CreateCheckoutSessionInput = z.object({
  interval: enumField(BILLING_INTERVALS, 'Interval'),
});

export type CreateCheckoutSessionInput = z.infer<
  typeof CreateCheckoutSessionInput
>;
